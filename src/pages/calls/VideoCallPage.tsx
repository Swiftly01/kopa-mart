import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Mic,
  MicOff,
  PhoneOff,
  RefreshCcw,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatCallDuration } from "@/components/chat/chatDateUtils";
import { useCall } from "@/context/CallContext";
import { CallType } from "@/types/chat";

function isMobileUserAgent(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function VideoCallPage() {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const {
    call,
    localStream,
    remoteStream,
    endCall,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
    switchCamera,
  } = useCall();

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile] = useState(isMobileUserAgent());

  // If this page is opened without a live matching call (deep link, refresh,
  // call already ended), bounce back rather than showing an empty shell.
  useEffect(() => {
    if (!call || call.callId !== callId || call.type !== CallType.VIDEO) {
      navigate("/messages", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call?.callId, call?.type, callId]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  if (!call) return null;

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => undefined);
    } else {
      await document.exitFullscreen().catch(() => undefined);
    }
  };

  const [first, ...rest] = call.peerName.split(" ");

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 text-white">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 object-cover w-full h-full"
      />

      {call.phase !== "connected" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/85">
          <Avatar className="size-28 ring-4 ring-white/20">
            <AvatarFallback className="text-3xl bg-white/15 text-white">
              {getInitials(first, rest.join(" "))}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-semibold">{call.peerName}</h2>
          <p className="text-sm opacity-80">Connecting…</p>
        </div>
      )}

      {!call.isCameraOff && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute object-cover border-2 rounded-2xl shadow-elevated top-4 right-4 w-28 h-40 sm:w-36 sm:h-52 border-white/20"
        />
      )}

      <div className="relative z-10 flex items-center justify-between px-4 pt-4">
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-black/40 backdrop-blur">
          {call.phase === "connected" ? formatCallDuration(call.durationSeconds) : "Connecting…"}
        </span>
        {!isMobile && (
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center rounded-full size-10 bg-black/40 backdrop-blur hover:bg-black/60"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
          </button>
        )}
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 px-6 pb-10 mt-auto">
        <button
          onClick={toggleMute}
          className="flex items-center justify-center rounded-full size-14 bg-white/15 backdrop-blur hover:bg-white/25"
          aria-label={call.isMuted ? "Unmute" : "Mute"}
        >
          {call.isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </button>

        <button
          onClick={toggleCamera}
          className="flex items-center justify-center rounded-full size-14 bg-white/15 backdrop-blur hover:bg-white/25"
          aria-label={call.isCameraOff ? "Turn camera on" : "Turn camera off"}
        >
          {call.isCameraOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
        </button>

        {isMobile && (
          <button
            onClick={() => void switchCamera()}
            disabled={call.isCameraOff}
            className="flex items-center justify-center rounded-full size-14 bg-white/15 backdrop-blur hover:bg-white/25 disabled:opacity-40"
            aria-label="Switch camera"
          >
            <RefreshCcw className="size-5" />
          </button>
        )}

        <button
          onClick={endCall}
          className="flex items-center justify-center transition-transform rounded-full size-16 bg-destructive active:scale-95"
          aria-label="End call"
        >
          <PhoneOff className="size-6" />
        </button>

        {isMobile && (
          <button
            onClick={toggleSpeaker}
            className="flex items-center justify-center rounded-full size-14 bg-white/15 backdrop-blur hover:bg-white/25"
            aria-label={call.isSpeakerOn ? "Speaker off" : "Speaker on"}
          >
            {call.isSpeakerOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          </button>
        )}
      </div>
    </div>
  );
}
