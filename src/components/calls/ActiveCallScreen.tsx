import { useEffect, useRef } from "react";
import { Mic, MicOff, PhoneOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatCallDuration } from "@/components/chat/chatDateUtils";
import { ActiveCallInfo } from "@/context/CallContext";
import { CallType } from "@/types/chat";

export function ActiveCallScreen({
  call,
  localStream,
  remoteStream,
  onEnd,
  onToggleMute,
  onToggleCamera,
  onToggleSpeaker,
}: {
  call: ActiveCallInfo;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleSpeaker: () => void;
}) {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const isVideo = call.type === CallType.VIDEO;

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  const [first, ...rest] = call.peerName.split(" ");
  const connecting = call.phase === "connecting";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 text-white">
      {isVideo ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 object-cover w-full h-full"
        />
      ) : (
        <audio ref={remoteAudioRef} autoPlay />
      )}

      {(!isVideo || connecting) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/80">
          <Avatar className="size-28 ring-4 ring-white/20">
            <AvatarFallback className="text-3xl bg-white/15 text-white">
              {getInitials(first, rest.join(" "))}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-semibold">{call.peerName}</h2>
        </div>
      )}

      {isVideo && !call.isCameraOff && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute object-cover border-2 rounded-2xl shadow-elevated top-4 right-4 w-28 h-40 border-white/20"
        />
      )}

      <div className="relative z-10 flex justify-center pt-6">
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-black/40 backdrop-blur">
          {connecting ? "Connecting…" : formatCallDuration(call.durationSeconds)}
        </span>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-5 px-6 pb-12 mt-auto">
        <button
          onClick={onToggleMute}
          className="flex items-center justify-center rounded-full size-14 bg-white/15 backdrop-blur hover:bg-white/25"
          aria-label={call.isMuted ? "Unmute" : "Mute"}
        >
          {call.isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </button>

        {isVideo && (
          <button
            onClick={onToggleCamera}
            className="flex items-center justify-center rounded-full size-14 bg-white/15 backdrop-blur hover:bg-white/25"
            aria-label={call.isCameraOff ? "Turn camera on" : "Turn camera off"}
          >
            {call.isCameraOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
          </button>
        )}

        <button
          onClick={onEnd}
          className="flex items-center justify-center transition-transform rounded-full size-16 bg-destructive active:scale-95"
          aria-label="End call"
        >
          <PhoneOff className="size-6" />
        </button>

        <button
          onClick={onToggleSpeaker}
          className="flex items-center justify-center rounded-full size-14 bg-white/15 backdrop-blur hover:bg-white/25"
          aria-label={call.isSpeakerOn ? "Speaker off" : "Speaker on"}
        >
          {call.isSpeakerOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </button>
      </div>
    </div>
  );
}
