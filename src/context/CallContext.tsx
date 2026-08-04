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
import { useAuth } from "./AuthContext";
import { getCallSocket } from "@/lib/socket/socketManager";
import { CallType, RTCIceServerConfig } from "@/types/chat";
import appToast from "@/lib/appToast";

export type CallPhase =
  | "idle"
  | "outgoing"
  | "incoming"
  | "connecting"
  | "active"
  | "ended";

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
  endedReason?: string;
}

interface CallContextValue {
  call: ActiveCallInfo | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
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
}

const CallContext = createContext<CallContextValue | undefined>(undefined);

const DEFAULT_ICE_SERVERS: RTCIceServerConfig[] = [
  { urls: "stun:stun.l.google.com:19302" },
];

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const remoteDescSet = useRef(false);
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
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

  useEffect(() => {
    if (!session?.token) return;
    const socket = getCallSocket(session.token);
    socketRef.current = socket;

    const onIncoming = (data: {
      callId: string;
      type: CallType;
      caller: { id: string; name: string };
      iceServers: RTCIceServerConfig[];
    }) => {
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
        phase: "incoming",
        isCaller: false,
        peerId: data.caller.id,
        peerName: data.caller.name,
        isMuted: false,
        isCameraOff: false,
        isSpeakerOn: true,
        durationSeconds: 0,
      });
    };

    const onPeerJoined = () => {
      void createOfferIfCaller();
    };

    const onOffer = async (data: { sdpType: "offer" | "answer"; sdp: string }) => {
      const pc = pcRef.current;
      if (!pc) return;
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
      setCall((prev) => (prev ? { ...prev, phase: "active" } : prev));
      startDurationTimer();
    };

    const onAnswer = async (data: { sdpType: "offer" | "answer"; sdp: string }) => {
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription({ type: data.sdpType, sdp: data.sdp });
      remoteDescSet.current = true;
      await flushPendingCandidates(pc);
      setCall((prev) => (prev ? { ...prev, phase: "active" } : prev));
      startDurationTimer();
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

    const onUnreachable = () => {
      appToast({
        title: "User unavailable",
        description: "They're not online right now.",
        variant: "destructive",
      });
      teardown("unreachable");
    };

    const onMissed = () => {
      appToast({ title: "No answer" });
      teardown("missed");
    };

    const onDecline = () => {
      appToast({ title: "Call declined" });
      teardown("declined");
    };

    const onCancelled = () => {
      teardown("cancelled");
    };

    const onEnded = (data: { durationSeconds?: number }) => {
      teardown("ended", data.durationSeconds);
    };

    const onFailed = (data: { reason?: string }) => {
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

    return () => {
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token]);

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

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        // Let the server-side disconnect/end handlers drive cleanup; this
        // just avoids a stuck "connecting" UI if ICE never completes.
      }
    };

    pcRef.current = pc;
    return pc;
  }

  async function acquireLocalMedia(type: CallType): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === CallType.VIDEO,
    });
    setLocalStream(stream);
    return stream;
  }

  async function createOfferIfCaller() {
    setCall((prev) => {
      if (!prev || !prev.isCaller) return prev;
      return { ...prev, phase: "connecting" };
    });

    const pc = pcRef.current;
    if (!pc) return;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current?.emit("call_offer", {
      callId: callRef.current?.callId,
      sdpType: offer.type,
      sdp: offer.sdp,
    });
  }

  function teardown(reason: string, durationSeconds?: number) {
    stopDurationTimer();
    pcRef.current?.getSenders().forEach((s) => s.track?.stop());
    pcRef.current?.close();
    pcRef.current = null;
    remoteDescSet.current = false;
    pendingCandidates.current = [];
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    incomingCallRef.current = null;
    setCall((prev) =>
      prev
        ? {
            ...prev,
            phase: "ended",
            endedReason: reason,
            durationSeconds: durationSeconds ?? prev.durationSeconds,
          }
        : prev,
    );
    setTimeout(() => setCall(null), 2500);
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

      socket.emit(
        "call_initiate",
        { calleeId, type, conversationId },
        (ack: {
          event: string;
          callId: string;
          iceServers?: RTCIceServerConfig[];
          message?: string;
        }) => {
          if (ack.event === "call_unreachable") {
            appToast({
              title: "User unavailable",
              description: ack.message,
              variant: "destructive",
            });
            stream.getTracks().forEach((t) => t.stop());
            setLocalStream(null);
            return;
          }

          iceServersRef.current = ack.iceServers ?? DEFAULT_ICE_SERVERS;
          const pc = createPeerConnection(ack.callId);
          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
          });

          setCall({
            callId: ack.callId,
            type,
            phase: "outgoing",
            isCaller: true,
            peerId: calleeId,
            peerName: calleeName,
            isMuted: false,
            isCameraOff: false,
            isSpeakerOn: true,
            durationSeconds: 0,
          });
        },
      );
    },
    [],
  );

  const acceptCall = useCallback(async () => {
    const incoming = incomingCallRef.current;
    const socket = socketRef.current;
    if (!incoming || !socket) return;

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
    socketRef.current?.emit("call_cancel", { callId: call.callId });
    teardown("cancelled");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call]);

  const endCall = useCallback(() => {
    if (!call) return;
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
    // toggles a UI flag consumers can use to pick which <audio> sink /
    // volume profile to render (via setSinkId where supported).
    setCall((prev) => (prev ? { ...prev, isSpeakerOn: !prev.isSpeakerOn } : prev));
  }, []);

  const value = useMemo<CallContextValue>(
    () => ({
      call,
      localStream,
      remoteStream,
      startCall,
      acceptCall,
      declineCall,
      cancelCall,
      endCall,
      toggleMute,
      toggleCamera,
      toggleSpeaker,
    }),
    [
      call,
      localStream,
      remoteStream,
      startCall,
      acceptCall,
      declineCall,
      cancelCall,
      endCall,
      toggleMute,
      toggleCamera,
      toggleSpeaker,
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
