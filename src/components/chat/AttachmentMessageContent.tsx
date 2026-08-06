import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Download, FileText } from "lucide-react";
import { MessageType } from "@/types/chat";
import { VoiceMessagePlayer } from "./VoiceMessagePlayer";
import { cn } from "@/lib/utils/utils";

export function AttachmentMessageContent({
  type,
  mediaUrl,
  fileName,
  variant,
}: {
  type: MessageType;
  mediaUrl: string;
  fileName: string | null;
  variant: "incoming" | "outgoing";
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (type === MessageType.IMAGE) {
    return (
      <>
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="block overflow-hidden rounded-xl max-w-[240px]"
        >
          <img
            src={mediaUrl}
            alt={fileName || "Shared image"}
            className="object-cover w-full h-auto max-h-72"
            loading="lazy"
          />
        </button>
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl p-2 bg-black/95 border-none">
            <DialogTitle className="sr-only">{fileName || "Image preview"}</DialogTitle>
            <img
              src={mediaUrl}
              alt={fileName || "Shared image"}
              className="w-full h-auto rounded-lg max-h-[80vh] object-contain"
            />
            <a
              href={mediaUrl}
              download={fileName || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-full top-3 right-3 bg-white/10 hover:bg-white/20"
            >
              <Download className="size-3.5" /> Download
            </a>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (type === MessageType.AUDIO) {
    return <VoiceMessagePlayer src={mediaUrl} variant={variant} />;
  }

  // FILE / documents
  return (
    <a
      href={mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 min-w-[200px] transition-colors",
        variant === "outgoing"
          ? "bg-primary-foreground/15 hover:bg-primary-foreground/20"
          : "bg-background hover:bg-muted",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-lg size-9 shrink-0",
          variant === "outgoing" ? "bg-primary-foreground/20" : "bg-secondary",
        )}
      >
        <FileText className="size-4" />
      </span>
      <span className="flex-1 text-sm truncate">{fileName || "Attachment"}</span>
      <Download className="size-4 shrink-0 opacity-70" />
    </a>
  );
}
