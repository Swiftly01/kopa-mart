import { useEffect, useRef, useState } from "react";
import { Trash2, Send } from "lucide-react";
import { formatCallDuration } from "./chatDateUtils";
import appToast from "@/lib/appToast";

function pickMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

export function VoiceRecorder({
  onRecorded,
  onCancel,
}: {
  onRecorded: (file: File, durationSeconds: number) => void;
  onCancel: () => void;
}) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array(24).fill(20));
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const tick = () => {
          const analyser = analyserRef.current;
          if (!analyser) return;
          const data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(data);
          const bucket = Math.floor(data.length / 24);
          setLevels(
            Array.from({ length: 24 }, (_, i) => {
              const slice = data.slice(i * bucket, (i + 1) * bucket);
              const avg = slice.reduce((a, b) => a + b, 0) / (slice.length || 1);
              return Math.max(15, Math.min(100, (avg / 255) * 100));
            }),
          );
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();

        const mimeType = pickMimeType();
        const recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined,
        );
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.start();
      } catch {
        appToast({
          title: "Microphone access needed",
          description: "Allow microphone access to record a voice note.",
          variant: "destructive",
        });
        onCancel();
      }
    }

    void start();
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);

    return () => {
      cancelled = true;
      clearInterval(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = (send: boolean) => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return onCancel();

    recorder.onstop = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (!send) return onCancel();
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || "audio/webm",
      });
      const file = new File([blob], `voice-note-${Date.now()}.webm`, {
        type: blob.type,
      });
      onRecorded(file, seconds);
    };

    if (recorder.state !== "inactive") recorder.stop();
    else onCancel();
  };

  return (
    <div className="flex items-center gap-3 px-2 py-1 animate-in fade-in slide-in-from-bottom-2">
      <button
        onClick={() => finish(false)}
        className="flex items-center justify-center rounded-full size-9 shrink-0 bg-destructive/10 text-destructive hover:bg-destructive/20"
        aria-label="Cancel recording"
      >
        <Trash2 className="size-4" />
      </button>

      <div className="flex items-center flex-1 h-9 gap-2 px-3 rounded-full bg-muted">
        <span className="text-xs font-medium tabular-nums text-destructive shrink-0">
          {formatCallDuration(seconds)}
        </span>
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex w-full h-full rounded-full opacity-75 bg-destructive animate-ping" />
          <span className="relative inline-flex rounded-full size-2 bg-destructive" />
        </span>
        <div className="flex items-center flex-1 h-full gap-[2px] overflow-hidden">
          {levels.map((l, i) => (
            <span
              key={i}
              style={{ height: `${l}%` }}
              className="w-[3px] rounded-full bg-primary/70 transition-all duration-75"
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => finish(true)}
        className="flex items-center justify-center text-white rounded-full size-9 shrink-0 bg-gradient-primary"
        aria-label="Send voice note"
      >
        <Send className="size-4" />
      </button>
    </div>
  );
}
