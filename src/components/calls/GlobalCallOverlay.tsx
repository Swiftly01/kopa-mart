
import { useCall } from "@/context/CallContext";
import { IncomingCallScreen } from "./IncomingCallScreen";
import { OutgoingCallScreen } from "./OutgoingCallScreen";
import { ActiveCallScreen } from "./ActiveCallScreen";
import { CallEndedScreen } from "./CallEndedScreen";
import { CallType } from "@/types/chat";
import { useCallSound } from "@/hooks/calls/useCallSound";
import { useCallNotification } from "@/hooks/calls/useCallNotification";

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

  
  useCallSound(call?.phase);

  
  useCallNotification(call?.phase, call?.peerName, call?.type);

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
