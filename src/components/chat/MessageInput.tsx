import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Paperclip, Send, Mic, X, Image as ImageIcon, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AttachmentPreviewBar } from "./AttachmentPreviewBar";
import { VoiceRecorder } from "./VoiceRecorder";
import { useChatSocket } from "@/context/ChatSocketContext";
import useSendMessage from "@/hooks/messages/mutations/useSendMessage";
import { uploadChatMedia, ChatMediaUnavailableError } from "@/services/chatMediaService";
import { Message, MessageType } from "@/types/chat";
import { cn } from "@/lib/utils/utils";

export interface StagedAttachment {
  file: File;
  kind: "image" | "file" | "audio";
  previewUrl: string;
  status: "idle" | "uploading" | "ready" | "error";
  progress: number;
  uploadedUrl?: string;
  errorMessage?: string;
}

export function MessageInput({
  conversationId,
  replyTo,
  onCancelReply,
}: {
  conversationId: string;
  replyTo?: Message | null;
  onCancelReply?: () => void;
}) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<StagedAttachment | null>(null);
  const [recording, setRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  const { startTyping, stopTyping } = useChatSocket();
  const sendMessage = useSendMessage();

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  useEffect(() => {
    return () => {
      if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    };
  }, [attachment?.previewUrl]);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    startTyping(conversationId);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => stopTyping(conversationId), 2000);
  };

  const runUpload = useCallback(async (draft: StagedAttachment) => {
    setAttachment({ ...draft, status: "uploading", progress: 0, errorMessage: undefined });
    try {
      const result = await uploadChatMedia(draft.file, (percent) => {
        setAttachment((prev) =>
          prev && prev.file === draft.file ? { ...prev, progress: percent } : prev,
        );
      });
      setAttachment((prev) =>
        prev && prev.file === draft.file
          ? { ...prev, status: "ready", uploadedUrl: result.url, progress: 100 }
          : prev,
      );
    } catch (error) {
      const message =
        error instanceof ChatMediaUnavailableError
          ? "Attachments aren't supported by the server yet."
          : "Upload failed. Check your connection and try again.";
      setAttachment((prev) =>
        prev && prev.file === draft.file
          ? { ...prev, status: "error", errorMessage: message }
          : prev,
      );
    }
  }, []);

  const stageFile = (file: File, kind: StagedAttachment["kind"]) => {
    const draft: StagedAttachment = {
      file,
      kind,
      previewUrl: kind === "image" ? URL.createObjectURL(file) : "",
      status: "idle",
      progress: 0,
    };
    void runUpload(draft);
  };

  const onPickImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) stageFile(file, "image");
    e.target.value = "";
  };

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) stageFile(file, "file");
    e.target.value = "";
  };

  const onVoiceRecorded = (file: File, _durationSeconds: number) => {
    setRecording(false);
    stageFile(file, "audio");
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;
    if (attachment && attachment.status !== "ready") return; // still uploading / failed

    stopTyping(conversationId);
    clearTimeout(typingTimeout.current);

    const clientId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    if (attachment && attachment.uploadedUrl) {
      const typeMap: Record<StagedAttachment["kind"], MessageType> = {
        image: MessageType.IMAGE,
        file: MessageType.FILE,
        audio: MessageType.AUDIO,
      };
      sendMessage.mutate({
        clientId,
        conversationId,
        type: typeMap[attachment.kind],
        mediaUrl: attachment.uploadedUrl,
        fileName: attachment.file.name,
        content: trimmed || undefined,
        replyToId: replyTo?.id,
      });
      setAttachment(null);
    } else {
      sendMessage.mutate({
        clientId,
        conversationId,
        content: trimmed,
        type: MessageType.TEXT,
        replyToId: replyTo?.id,
      });
    }

    setText("");
    onCancelReply?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 || (attachment && attachment.status === "ready");

  if (recording) {
    return (
      <div className="border-t border-border bg-background">
        <VoiceRecorder onRecorded={onVoiceRecorded} onCancel={() => setRecording(false)} />
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-background">
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/40">
          <div className="flex-1 min-w-0 pl-2 border-l-2 border-primary">
            <p className="text-xs font-medium text-primary">
              Replying to {replyTo.sender.firstName}
            </p>
            <p className="text-xs truncate text-muted-foreground">
              {replyTo.content || `[${replyTo.type}]`}
            </p>
          </div>
          <button onClick={onCancelReply} className="p-1 rounded-full hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>
      )}

      {attachment && (
        <AttachmentPreviewBar
          attachment={attachment}
          onRemove={() => setAttachment(null)}
          onRetry={() => runUpload(attachment)}
        />
      )}

      <div className="flex items-end gap-2 px-3 py-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={onPickImage}
        />
        <input ref={fileInputRef} type="file" className="hidden" onChange={onPickFile} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center justify-center text-muted-foreground rounded-full size-10 shrink-0 hover:bg-muted disabled:opacity-40"
              aria-label="Attach"
              disabled={!!attachment}
            >
              <Paperclip className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
              <ImageIcon className="mr-2 size-4" /> Photo or video
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <FileText className="mr-2 size-4" /> Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Message"
          className="flex-1 resize-none rounded-2xl border border-input bg-muted/40 px-4 py-2.5 text-[15px] leading-tight focus:outline-none focus:ring-2 focus:ring-ring max-h-[120px]"
        />

        {canSend ? (
          <Button
            size="icon"
            onClick={handleSend}
            className={cn("rounded-full size-10 shrink-0 bg-gradient-primary")}
            aria-label="Send"
          >
            <Send className="size-[18px]" />
          </Button>
        ) : (
          <button
            onClick={() => setRecording(true)}
            className="flex items-center justify-center text-white rounded-full size-10 shrink-0 bg-gradient-primary"
            aria-label="Record voice note"
          >
            <Mic className="size-[18px]" />
          </button>
        )}
      </div>
    </div>
  );
}
