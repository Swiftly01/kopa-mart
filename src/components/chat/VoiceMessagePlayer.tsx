import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { formatCallDuration } from "./chatDateUtils";

// Deterministic pseudo-waveform so bars don't reshuffle on re-render.
const BAR_HEIGHTS = Array.from({ length: 28 }, (_, i) =>
  30 + Math.round(Math.abs(Math.sin(i * 12.9898)) * 70),
);

export function VoiceMessagePlayer({
  src,
  variant = "incoming",
}: {
  src: string;
  variant?: "incoming" | "outgoing";
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setProgress(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      void audio.play();
    }
    setPlaying(!playing);
  };

  const activeBars = duration
    ? Math.round((progress / duration) * BAR_HEIGHTS.length)
    : 0;

  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        onClick={togglePlay}
        className={cn(
          "flex items-center justify-center rounded-full size-9 shrink-0 transition-colors",
          variant === "outgoing"
            ? "bg-primary-foreground/20 text-primary-foreground"
            : "bg-primary text-primary-foreground",
        )}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
      </button>
      <div className="flex items-center flex-1 h-6 gap-[2px]">
        {BAR_HEIGHTS.map((h, i) => (
          <span
            key={i}
            style={{ height: `${h}%` }}
            className={cn(
              "w-[3px] rounded-full transition-colors",
              i < activeBars
                ? variant === "outgoing"
                  ? "bg-primary-foreground"
                  : "bg-primary"
                : variant === "outgoing"
                  ? "bg-primary-foreground/30"
                  : "bg-muted-foreground/30",
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          "text-[11px] tabular-nums shrink-0",
          variant === "outgoing" ? "text-primary-foreground/80" : "text-muted-foreground",
        )}
      >
        {formatCallDuration(Math.round(playing || progress ? progress : duration))}
      </span>
    </div>
  );
}
