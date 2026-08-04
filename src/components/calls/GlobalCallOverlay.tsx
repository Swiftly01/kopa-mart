import { useCall } from "@/context/CallContext";
import { IncomingCallScreen } from "./IncomingCallScreen";
import { OutgoingCallScreen } from "./OutgoingCallScreen";
import { ActiveCallScreen } from "./ActiveCallScreen";

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

  if (!call || call.phase === "ended") return null;

  if (call.phase === "incoming") {
    return (
      <IncomingCallScreen call={call} onAccept={acceptCall} onDecline={declineCall} />
    );
  }

  if (call.phase === "outgoing") {
    return <OutgoingCallScreen call={call} onCancel={cancelCall} />;
  }

  // "connecting" and "active" both render the in-call screen; the screen
  // itself shows a "Connecting…" state until the peer connection is live.
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
