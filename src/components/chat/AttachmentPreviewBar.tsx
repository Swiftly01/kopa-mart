import { FileText, Mic, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { StagedAttachment } from "./MessageInput";

export function AttachmentPreviewBar({
  attachment,
  onRemove,
  onRetry,
}: {
  attachment: StagedAttachment;
  onRemove: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-t border-border bg-muted/40">
      <div className="relative shrink-0">
        {attachment.kind === "image" ? (
          <img
            src={attachment.previewUrl}
            alt={attachment.file.name}
            className="object-cover rounded-lg size-12"
          />
        ) : (
          <div className="flex items-center justify-center rounded-lg size-12 bg-secondary text-secondary-foreground">
            {attachment.kind === "audio" ? (
              <Mic className="size-5" />
            ) : (
              <FileText className="size-5" />
            )}
          </div>
        )}
        {attachment.status === "uploading" && (
          <svg
            className="absolute -top-1 -left-1 size-14 -rotate-90"
            viewBox="0 0 56 56"
          >
            <circle cx="28" cy="28" r="25" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
            <circle
              cx="28"
              cy="28"
              r="25"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeDasharray={2 * Math.PI * 25}
              strokeDashoffset={2 * Math.PI * 25 * (1 - attachment.progress / 100)}
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {attachment.kind === "audio" ? "Voice note" : attachment.file.name}
        </p>
        <p
          className={cn(
            "text-xs",
            attachment.status === "error" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {attachment.status === "uploading" && `Uploading… ${attachment.progress}%`}
          {attachment.status === "error" &&
            (attachment.errorMessage || "Upload failed")}
          {attachment.status === "ready" && "Ready to send"}
          {attachment.status === "idle" && "Preparing…"}
        </p>
      </div>

      {attachment.status === "error" && (
        <button
          onClick={onRetry}
          className="flex items-center justify-center rounded-full size-8 shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/80"
          aria-label="Retry upload"
        >
          <RotateCcw className="size-4" />
        </button>
      )}
      <button
        onClick={onRemove}
        className="flex items-center justify-center rounded-full size-8 shrink-0 hover:bg-muted"
        aria-label="Remove attachment"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
