import { useCall } from "@/context/CallContext";
import { IncomingCallScreen } from "./IncomingCallScreen";
import { OutgoingCallScreen } from "./OutgoingCallScreen";
import { ActiveCallScreen } from "./ActiveCallScreen";
import { CallEndedScreen } from "./CallEndedScreen";
import { CallType } from "@/types/chat";

const TERMINAL_PHASES = new Set([
  "declined",
  "missed",
  "cancelled",
  "ended",
  "failed",
  "unreachable",
  "busy",
]);

export function GlobalCallOverlay() {
  const {
    call,
    localStream,
    remoteStream,
    acceptCall,
    declineCall,
    cancelCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
  } = useCall();

  if (!call) return null;

  if (TERMINAL_PHASES.has(call.phase)) {
    return <CallEndedScreen call={call} />;
  }

  if (call.phase === "ringing") {
    return (
      <IncomingCallScreen call={call} onAccept={acceptCall} onDecline={declineCall} />
    );
  }

  if (call.phase === "calling") {
    return <OutgoingCallScreen call={call} onCancel={cancelCall} />;
  }

  // "connecting" / "connected": video calls hand off to the dedicated
  // /call/:callId route the instant they connect (see CallContext), so this
  // modal only needs to cover voice calls, plus the brief video "connecting"
  // window before that navigation happens.
  if (call.type === CallType.VOICE || call.phase === "connecting") {
    return (
      <ActiveCallScreen
        call={call}
        localStream={localStream}
        remoteStream={remoteStream}
        onEnd={endCall}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onToggleSpeaker={toggleSpeaker}
      />
    );
  }

  return null;
}
