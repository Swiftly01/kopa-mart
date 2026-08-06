import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Socket } from "socket.io-client";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getCallSocket } from "@/lib/socket/socketManager";
import { CallType, RTCIceServerConfig } from "@/types/chat";
import appToast from "@/lib/appToast";

/**
 * Idle → Calling/Ringing → Connecting → Connected → (Declined|Missed|
 * Cancelled|Ended|Failed|Unreachable|Busy), then back to Idle.
 *
 *  - "calling"  : caller's full-screen "Calling…" state, before the callee
 *                 has answered.
 *  - "ringing"  : callee's full-screen incoming-call state.
 *  - "connecting": accepted, exchanging SDP/ICE, media not flowing yet.
 *  - "connected": media flowing. Video calls navigate to a dedicated
 *                 `/call/:callId` route the moment this is reached; voice
 *                 calls stay on a full-screen modal.
 *  - anything else is a terminal reason, shown briefly before resetting.
 */
export type CallPhase =
  | "idle"
  | "calling"
  | "ringing"
  | "connecting"
  | "connected"
  | "declined"
  | "missed"
  | "cancelled"
  | "ended"
  | "failed"
  | "unreachable"
  | "busy";

const TERMINAL_PHASES: CallPhase[] = [
  "declined",
  "missed",
  "cancelled",
  "ended",
  "failed",
  "unreachable",
  "busy",
];

export interface ActiveCallInfo {
  callId: string;
  type: CallType;
  phase: CallPhase;
  isCaller: boolean;
  peerId: string;
  peerName: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeakerOn: boolean;
  durationSeconds: number;
}

interface CallContextValue {
  call: ActiveCallInfo | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isBusy: boolean;
  startCall: (
    calleeId: string,
    calleeName: string,
    type: CallType,
    conversationId?: string,
  ) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => void;
  cancelCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleSpeaker: () => void;
  switchCamera: () => Promise<void>;
}

const CallContext = createContext<CallContextValue | undefined>(undefined);

const DEFAULT_ICE_SERVERS: RTCIceServerConfig[] = [
  { urls: "stun:stun.l.google.com:19302" },
];

// Mirrors the backend's own 30s missed-call timeout (call.gateway.ts). The
// backend only notifies the *caller*'s side of a room-scoped miss/cancel
// once the callee has joined the call room — until the callee accepts, they
// haven't joined it, so they never receive `call_missed`/`call_cancelled`
// themselves (see CHAT_INTEGRATION_ANALYSIS.md). This client-side timer is
// the safety net so the callee's ringing screen doesn't hang forever if the
// caller cancels or simply nobody answers in time.
const RINGING_TIMEOUT_MS = 30_000;
// Safety net for the "connecting" phase itself: if SDP/ICE negotiation
// stalls or silently throws partway through (no visible error otherwise —
// see the try/catch added around offer/answer handling), the call would
// otherwise sit on "Connecting…" forever with no way out for the user.
const CONNECTING_TIMEOUT_MS = 20_000;
// Safety net for the `call_initiate` acknowledgement itself: if the server
// throws (e.g. "User is already in a call"), Nest's WsExceptionFilter emits
// a generic `exception` event rather than resolving our ack callback, so the
// ack can otherwise hang indefinitely.
const INITIATE_ACK_TIMEOUT_MS = 12_000;

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  // `call_peer_joined` can arrive from the server before the `call_initiate`
  // ack resolves (e.g. the callee accepts fast), i.e. before pcRef.current
  // exists. Without this flag that event is dropped silently and no offer
  // is ever sent — both sides then sit on "connecting" until the 20s
  // CONNECTING_TIMEOUT_MS safety net fires. Mirrors `peerJoinedPending` in
  // call-gateway-tester.html.
  const peerJoinedPendingRef = useRef(false);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const remoteDescSet = useRef(false);
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initiateAckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const returnPathRef = useRef<string>("/messages");
  const incomingCallRef = useRef<{
    callId: string;
    type: CallType;
    peerId: string;
    peerName: string;
    iceServers: RTCIceServerConfig[];
  } | null>(null);
  const iceServersRef = useRef<RTCIceServerConfig[]>(DEFAULT_ICE_SERVERS);

  const [call, setCall] = useState<ActiveCallInfo | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const callRef = useRef<ActiveCallInfo | null>(null);
  useEffect(() => {
    callRef.current = call;
  }, [call]);
  const localStreamRef = useRef<MediaStream | null>(null);
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const isBusy =
    call !== null && !TERMINAL_PHASES.includes(call.phase) && call.phase !== "idle";

  // Navigate to the dedicated video-call page the moment a video call
  // connects; navigate back once it leaves the "connected" state.
  useEffect(() => {
    if (!call) return;
    if (call.type !== CallType.VIDEO) return;

    if (call.phase === "connected" && location.pathname !== `/call/${call.callId}`) {
      returnPathRef.current = location.pathname;
      navigate(`/call/${call.callId}`);
    }

    if (TERMINAL_PHASES.includes(call.phase) && location.pathname === `/call/${call.callId}`) {
      navigate(returnPathRef.current || "/messages");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call?.phase, call?.type, call?.callId]);

  useEffect(() => {
    if (!session?.token) return;
    const socket = getCallSocket(session.token);
    socketRef.current = socket;

    const clearRingingTimer = () => {
      if (ringingTimer.current) clearTimeout(ringingTimer.current);
      ringingTimer.current = null;
    };

    const onIncoming = (data: {
      callId: string;
      type: CallType;
      caller: { id: string; name: string };
      iceServers: RTCIceServerConfig[];
    }) => {
      // Backend already refuses to ring a busy user at the DB layer, but
      // guard client-side too in case of a race — never clobber a call
      // already in progress, and let the would-be caller know we're busy.
      // (Computed fresh from the ref, not the `isBusy` closure variable,
      // since this listener is only attached once per socket connection.)
      const currentlyBusy =
        callRef.current !== null &&
        !TERMINAL_PHASES.includes(callRef.current.phase) &&
        callRef.current.phase !== "idle";
      if (currentlyBusy) {
        socket.emit("call_decline", { callId: data.callId });
        return;
      }

      incomingCallRef.current = {
        callId: data.callId,
        type: data.type,
        peerId: data.caller.id,
        peerName: data.caller.name,
        iceServers: data.iceServers,
      };
      iceServersRef.current = data.iceServers;
      setCall({
        callId: data.callId,
        type: data.type,
        phase: "ringing",
        isCaller: false,
        peerId: data.caller.id,
        peerName: data.caller.name,
        isMuted: false,
        isCameraOff: false,
        isSpeakerOn: true,
        durationSeconds: 0,
      });

      clearRingingTimer();
      ringingTimer.current = setTimeout(() => {
        if (callRef.current?.callId === data.callId && callRef.current.phase === "ringing") {
          teardown("missed");
        }
      }, RINGING_TIMEOUT_MS);
    };

    const onPeerJoined = () => {
      if (!pcRef.current) {
        // Ack for call_initiate hasn't resolved yet — remember it and let
        // the ack callback trigger the offer once the pc exists.
        peerJoinedPendingRef.current = true;
        return;
      }
      void createOfferIfCaller();
    };

    const onOffer = async (data: { sdpType: "offer" | "answer"; sdp: string }) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription({ type: data.sdpType, sdp: data.sdp });
        remoteDescSet.current = true;
        await flushPendingCandidates(pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("call_answer", {
          callId: incomingCallRef.current?.callId,
          sdpType: answer.type,
          sdp: answer.sdp,
        });
        clearConnectingTimeout();
        setCall((prev) => (prev ? { ...prev, phase: "connected" } : prev));
        startDurationTimer();
      } catch (error) {
        console.error("Failed to answer call offer:", error);
        appToast({
          title: "Couldn't connect the call",
          description: "Something went wrong setting up the connection.",
          variant: "destructive",
        });
        teardown("failed");
      }
    };

    const onAnswer = async (data: { sdpType: "offer" | "answer"; sdp: string }) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription({ type: data.sdpType, sdp: data.sdp });
        remoteDescSet.current = true;
        await flushPendingCandidates(pc);
        clearConnectingTimeout();
        setCall((prev) => (prev ? { ...prev, phase: "connected" } : prev));
        startDurationTimer();
      } catch (error) {
        console.error("Failed to process call answer:", error);
        appToast({
          title: "Couldn't connect the call",
          description: "Something went wrong setting up the connection.",
          variant: "destructive",
        });
        teardown("failed");
      }
    };

    const onIceCandidate = async (data: {
      candidate: string;
      sdpMid?: string;
      sdpMLineIndex?: number;
    }) => {
      const init: RTCIceCandidateInit = {
        candidate: data.candidate,
        sdpMid: data.sdpMid,
        sdpMLineIndex: data.sdpMLineIndex,
      };
      const pc = pcRef.current;
      if (pc && remoteDescSet.current) {
        await pc.addIceCandidate(init);
      } else {
        pendingCandidates.current.push(init);
      }
    };

    const onUnreachable = (data: { message?: string }) => {
      clearInitiateAckTimer();
      appToast({
        title: "User unavailable",
        description: data?.message || "They're not online right now.",
        variant: "destructive",
      });
      teardown("unreachable");
    };

    const onMissed = () => {
      clearInitiateAckTimer();
      teardown("missed");
    };

    const onDecline = () => {
      clearInitiateAckTimer();
      teardown("declined");
    };

    const onCancelled = () => {
      clearRingingTimer();
      teardown("cancelled");
    };

    const onEnded = (data: { durationSeconds?: number }) => {
      teardown("ended", data.durationSeconds);
    };

    const onFailed = (data: { reason?: string }) => {
      clearInitiateAckTimer();
      appToast({
        title: "Call failed",
        description: data.reason,
        variant: "destructive",
      });
      teardown("failed");
    };

    const onCallError = (data: { message: string }) => {
      appToast({ title: "Call error", description: data.message, variant: "destructive" });
    };

    // Nest's default WsExceptionFilter emits a generic `exception` event
    // (rather than resolving the ack callback) when a `@SubscribeMessage`
    // handler throws — e.g. `call_initiate` rejecting a busy user, a
    // self-call, or a rate limit. Surface those here.
    const onException = (data: { message?: string | string[]; status?: string }) => {
      clearInitiateAckTimer();
      const message = Array.isArray(data?.message)
        ? data.message.join(", ")
        : data?.message || "Something went wrong with the call.";

      if (callRef.current && !TERMINAL_PHASES.includes(callRef.current.phase)) {
        appToast({ title: "Call couldn't start", description: message, variant: "destructive" });
        teardown("failed");
      }
    };

    // Socket.IO room memberships (and any per-socket `client.data` set on
    // the server) do NOT survive a reconnect — a reconnect gets a brand
    // new server-side socket, which was never told to (re)join
    // `call:{callId}`. If that happens mid-call, every subsequent relayed
    // event (`call_peer_joined`, `call_offer`, `call_answer`,
    // `call_ice_candidate`) silently stops reaching this client, with
    // nothing on either end logging an error — it just looks like the
    // other side never sent anything. `handleJoin` on the backend accepts
    // *either* the caller or the callee as a valid participant (it only
    // checks `call.callerId/calleeId === userId`), so it doubles safely as
    // a generic "make sure I'm still in this call's room" recovery call for
    // both roles — re-emitting it after a reconnect re-establishes room
    // membership and, as a side effect, re-triggers `call_peer_joined` so
    // the caller re-sends a fresh SDP offer if negotiation had stalled.
    const onReconnect = (attempt: number) => {
      console.warn(`Call socket reconnected (attempt ${attempt}).`);
      const current = callRef.current;
      if (
        current?.callId &&
        (current.phase === "calling" ||
          current.phase === "connecting" ||
          current.phase === "connected")
      ) {
        socket.emit("call_join", { callId: current.callId });
      }
    };
    socket.io.on("reconnect", onReconnect);

    socket.on("call_incoming", onIncoming);
    socket.on("call_peer_joined", onPeerJoined);
    socket.on("call_offer", onOffer);
    socket.on("call_answer", onAnswer);
    socket.on("call_ice_candidate", onIceCandidate);
    socket.on("call_unreachable", onUnreachable);
    socket.on("call_missed", onMissed);
    socket.on("call_decline", onDecline);
    socket.on("call_cancelled", onCancelled);
    socket.on("call_ended", onEnded);
    socket.on("call_failed", onFailed);
    socket.on("call_error", onCallError);
    socket.on("exception", onException);

    return () => {
      socket.io.off("reconnect", onReconnect);
      socket.off("call_incoming", onIncoming);
      socket.off("call_peer_joined", onPeerJoined);
      socket.off("call_offer", onOffer);
      socket.off("call_answer", onAnswer);
      socket.off("call_ice_candidate", onIceCandidate);
      socket.off("call_unreachable", onUnreachable);
      socket.off("call_missed", onMissed);
      socket.off("call_decline", onDecline);
      socket.off("call_cancelled", onCancelled);
      socket.off("call_ended", onEnded);
      socket.off("call_failed", onFailed);
      socket.off("call_error", onCallError);
      socket.off("exception", onException);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token]);

  function clearInitiateAckTimer() {
    if (initiateAckTimer.current) clearTimeout(initiateAckTimer.current);
    initiateAckTimer.current = null;
  }

  function clearConnectingTimeout() {
    if (connectingTimer.current) clearTimeout(connectingTimer.current);
    connectingTimer.current = null;
  }

  function armConnectingTimeout() {
    clearConnectingTimeout();
    connectingTimer.current = setTimeout(() => {
      if (callRef.current && callRef.current.phase === "connecting") {
        appToast({
          title: "Couldn't establish the call",
          description: "The connection timed out. Please try again.",
          variant: "destructive",
        });
        teardown("failed");
      }
    }, CONNECTING_TIMEOUT_MS);
  }

  function startDurationTimer() {
    stopDurationTimer();
    durationTimer.current = setInterval(() => {
      setCall((prev) =>
        prev ? { ...prev, durationSeconds: prev.durationSeconds + 1 } : prev,
      );
    }, 1000);
  }

  function stopDurationTimer() {
    if (durationTimer.current) clearInterval(durationTimer.current);
    durationTimer.current = null;
  }

  async function flushPendingCandidates(pc: RTCPeerConnection) {
    const queued = pendingCandidates.current;
    pendingCandidates.current = [];
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        // ignore malformed/late candidates
      }
    }
  }

  function createPeerConnection(callId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: iceServersRef.current as RTCIceServer[],
    });

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      socketRef.current?.emit("call_ice_candidate", {
        callId,
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid ?? undefined,
        sdpMLineIndex: event.candidate.sdpMLineIndex ?? undefined,
      });
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0] ?? null);
    };

    pcRef.current = pc;
    return pc;
  }

  async function acquireLocalMedia(type: CallType): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === CallType.VIDEO ? { facingMode: "user" } : false,
    });
    setLocalStream(stream);
    return stream;
  }

  async function createOfferIfCaller() {
    if (ringingTimer.current) {
      clearTimeout(ringingTimer.current);
      ringingTimer.current = null;
    }

    setCall((prev) => {
      if (!prev || !prev.isCaller) return prev;
      return { ...prev, phase: "connecting" };
    });
    armConnectingTimeout();

    const pc = pcRef.current;
    if (!pc) return;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit("call_offer", {
        callId: callRef.current?.callId,
        sdpType: offer.type,
        sdp: offer.sdp,
      });
    } catch (error) {
      console.error("Failed to create call offer:", error);
      appToast({
        title: "Couldn't connect the call",
        description: "Something went wrong setting up the connection.",
        variant: "destructive",
      });
      teardown("failed");
    }
  }

  function teardown(reason: CallPhase, durationSeconds?: number) {
    stopDurationTimer();
    clearInitiateAckTimer();
    if (ringingTimer.current) {
      clearTimeout(ringingTimer.current);
      ringingTimer.current = null;
    }
    pcRef.current?.getSenders().forEach((s) => s.track?.stop());
    pcRef.current?.close();
    pcRef.current = null;
    peerJoinedPendingRef.current = false;
    remoteDescSet.current = false;
    pendingCandidates.current = [];
    clearConnectingTimeout();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    incomingCallRef.current = null;
    setCall((prev) =>
      prev
        ? {
            ...prev,
            phase: reason,
            durationSeconds: durationSeconds ?? prev.durationSeconds,
          }
        : prev,
    );
    setTimeout(() => setCall(null), 2800);
  }

  const startCall = useCallback(
    async (
      calleeId: string,
      calleeName: string,
      type: CallType,
      conversationId?: string,
    ) => {
      const socket = socketRef.current;
      if (!socket) return;

      if (isBusy) {
        appToast({
          title: "You're already on a call",
          description: "Finish your current call before starting another one.",
        });
        return;
      }

      let stream: MediaStream;
      try {
        stream = await acquireLocalMedia(type);
      } catch {
        appToast({
          title: "Permission needed",
          description: "Allow microphone/camera access to place a call.",
          variant: "destructive",
        });
        return;
      }

      setCall({
        callId: "",
        type,
        phase: "calling",
        isCaller: true,
        peerId: calleeId,
        peerName: calleeName,
        isMuted: false,
        isCameraOff: false,
        isSpeakerOn: true,
        durationSeconds: 0,
      });

      clearInitiateAckTimer();
      initiateAckTimer.current = setTimeout(() => {
        if (callRef.current && callRef.current.phase === "calling" && !callRef.current.callId) {
          appToast({
            title: "Couldn't reach the server",
            description: "The call request timed out. Please try again.",
            variant: "destructive",
          });
          teardown("failed");
        }
      }, INITIATE_ACK_TIMEOUT_MS);

      socket.emit(
        "call_initiate",
        { calleeId, type, conversationId },
        (ack: {
          event: string;
          callId: string;
          iceServers?: RTCIceServerConfig[];
          message?: string;
        }) => {
          clearInitiateAckTimer();

          if (ack.event === "call_unreachable") {
            appToast({
              title: "User unavailable",
              description: ack.message,
              variant: "destructive",
            });
            teardown("unreachable");
            return;
          }

          iceServersRef.current = ack.iceServers ?? DEFAULT_ICE_SERVERS;
          const pc = createPeerConnection(ack.callId);
          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
          });

          setCall((prev) =>
            prev && prev.phase === "calling"
              ? { ...prev, callId: ack.callId }
              : prev,
          );

          if (peerJoinedPendingRef.current) {
            peerJoinedPendingRef.current = false;
            void createOfferIfCaller();
          }
        },
      );
    },
    [isBusy],
  );

  const acceptCall = useCallback(async () => {
    const incoming = incomingCallRef.current;
    const socket = socketRef.current;
    if (!incoming || !socket) return;

    if (ringingTimer.current) {
      clearTimeout(ringingTimer.current);
      ringingTimer.current = null;
    }

    let stream: MediaStream;
    try {
      stream = await acquireLocalMedia(incoming.type);
    } catch {
      appToast({
        title: "Permission needed",
        description: "Allow microphone/camera access to answer.",
        variant: "destructive",
      });
      return;
    }

    const pc = createPeerConnection(incoming.callId);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    setCall((prev) => (prev ? { ...prev, phase: "connecting" } : prev));
    armConnectingTimeout();
    socket.emit("call_join", { callId: incoming.callId });
  }, []);

  const declineCall = useCallback(() => {
    const incoming = incomingCallRef.current;
    if (!incoming) return;
    socketRef.current?.emit("call_decline", { callId: incoming.callId });
    teardown("declined");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelCall = useCallback(() => {
    if (!call) return;
    if (call.callId) {
      socketRef.current?.emit("call_cancel", { callId: call.callId });
    } else {
      // Still waiting on the call_initiate ack — nothing exists server-side
      // yet to cancel, just stop waiting for it locally.
      clearInitiateAckTimer();
    }
    teardown("cancelled");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call]);

  const endCall = useCallback(() => {
    if (!call?.callId) return;
    socketRef.current?.emit("call_end", { callId: call.callId });
    teardown("ended", call.durationSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call]);

  const toggleMute = useCallback(() => {
    setCall((prev) => {
      if (!prev || !localStream) return prev;
      const next = !prev.isMuted;
      localStream.getAudioTracks().forEach((t) => (t.enabled = !next));
      return { ...prev, isMuted: next };
    });
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    setCall((prev) => {
      if (!prev || !localStream) return prev;
      const next = !prev.isCameraOff;
      localStream.getVideoTracks().forEach((t) => (t.enabled = !next));
      return { ...prev, isCameraOff: next };
    });
  }, [localStream]);

  const toggleSpeaker = useCallback(() => {
    // Browsers don't expose a reliable "force speakerphone" API; this
    // toggles a UI flag consumers use to pick an output route where
    // supported (e.g. HTMLMediaElement.setSinkId on Chrome/Android).
    setCall((prev) => (prev ? { ...prev, isSpeakerOn: !prev.isSpeakerOn } : prev));
  }, []);

  const switchCamera = useCallback(async () => {
    const pc = pcRef.current;
    const currentStream = localStreamRef.current;
    if (!pc || !currentStream) return;

    const currentTrack = currentStream.getVideoTracks()[0];
    if (!currentTrack) return;

    const currentFacing = currentTrack.getSettings().facingMode;
    const nextFacing = currentFacing === "environment" ? "user" : "environment";

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: nextFacing } },
      });
      const newTrack = newStream.getVideoTracks()[0];
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      await sender?.replaceTrack(newTrack);

      currentTrack.stop();
      const merged = new MediaStream([...currentStream.getAudioTracks(), newTrack]);
      localStreamRef.current = merged;
      setLocalStream(merged);
    } catch {
      appToast({
        title: "Couldn't switch camera",
        description: "This device may only have one camera available.",
        variant: "destructive",
      });
    }
  }, []);

  const value = useMemo<CallContextValue>(
    () => ({
      call,
      localStream,
      remoteStream,
      isBusy,
      startCall,
      acceptCall,
      declineCall,
      cancelCall,
      endCall,
      toggleMute,
      toggleCamera,
      toggleSpeaker,
      switchCamera,
    }),
    [
      call,
      localStream,
      remoteStream,
      isBusy,
      startCall,
      acceptCall,
      declineCall,
      cancelCall,
      endCall,
      toggleMute,
      toggleCamera,
      toggleSpeaker,
      switchCamera,
    ],
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export function useCall() {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
}
