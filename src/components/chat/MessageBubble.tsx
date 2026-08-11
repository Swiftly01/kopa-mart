import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoreVertical, RotateCcw, Reply as ReplyIcon } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { getInitials, formatMessageTime } from "./chatDateUtils";
import { MessageStatusTicks } from "./MessageStatusTicks";
import { AttachmentMessageContent } from "./AttachmentMessageContent";
import { Message, MessageType } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  showSenderName: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  repliedMessage?: Message | null;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onRetry?: (message: Message) => void;
  onReply?: (message: Message) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
  showSenderName,
  isFirstInGroup,
  isLastInGroup,
  repliedMessage,
  onEdit,
  onDelete,
  onRetry,
  onReply,
}: MessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content ?? "");

  if (message.type === MessageType.SYSTEM) {
    return (
      <div className="flex justify-center my-2">
        <span className="px-3 py-1 text-xs text-center rounded-full text-muted-foreground bg-muted/60">
          {message.content}
        </span>
      </div>
    );
  }

  const isDeleted = !!message.deletedAt;
  const isFailed = message.clientState === "failed";
  const canEdit = isOwn && message.type === MessageType.TEXT && !isDeleted;

  return (
    <div
      className={cn(
        "flex items-end gap-2 px-4 group",
        isOwn ? "justify-end" : "justify-start",
        isFirstInGroup ? "mt-3" : "mt-0.5",
      )}
    >
      {!isOwn && (
        <div className="w-7 shrink-0">
          {showAvatar && (
            <Avatar className="size-7">
              <AvatarImage
                src={
                  message.sender?.profilePictureThumbnailUrl ||
                  message.sender?.profilePictureUrl ||
                  undefined
                }
              />
              <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">
                {getInitials(message.sender?.firstName, message.sender?.lastName)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      <div className={cn("flex flex-col max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        {showSenderName && !isOwn && (
          <span className="px-1 mb-0.5 text-xs font-medium text-muted-foreground">
            {message.sender?.firstName}
          </span>
        )}

        <div className="relative flex items-center gap-1">
          {isOwn && !isDeleted && !editing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted shrink-0 order-first"
                  aria-label="Message options"
                >
                  <MoreVertical className="size-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onReply && (
                  <DropdownMenuItem onClick={() => onReply(message)}>
                    <ReplyIcon className="size-3.5 mr-2" /> Reply
                  </DropdownMenuItem>
                )}
                {canEdit && (
                  <DropdownMenuItem onClick={() => setEditing(true)}>Edit</DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete?.(message)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div
            className={cn(
              "px-3.5 py-2 text-[15px] leading-relaxed shadow-sm",
              isOwn
                ? "bg-gradient-primary text-primary-foreground"
                : "bg-muted text-foreground",
              // WhatsApp/iMessage-style grouped corners
              isOwn
                ? cn(
                    "rounded-2xl",
                    !isFirstInGroup && "rounded-tr-md",
                    !isLastInGroup && "rounded-br-md",
                  )
                : cn(
                    "rounded-2xl",
                    !isFirstInGroup && "rounded-tl-md",
                    !isLastInGroup && "rounded-bl-md",
                  ),
              isFailed && "ring-2 ring-destructive/60",
            )}
          >
            {repliedMessage && (
              <div
                className={cn(
                  "mb-1.5 rounded-lg px-2 py-1 text-xs border-l-2",
                  isOwn
                    ? "bg-primary-foreground/10 border-primary-foreground/40"
                    : "bg-background/60 border-primary/40",
                )}
              >
                <p className="font-medium truncate">
                  {repliedMessage.sender?.firstName}
                </p>
                <p className="truncate opacity-80">
                  {repliedMessage.content || `[${repliedMessage.type}]`}
                </p>
              </div>
            )}

            {isDeleted ? (
              <p className="italic opacity-70">This message was deleted</p>
            ) : editing ? (
              <div className="flex items-center gap-2 min-w-[160px]">
                <Input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="h-8 text-sm bg-background text-foreground"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onEdit?.({ ...message, content: draft });
                      setEditing(false);
                    }
                    if (e.key === "Escape") setEditing(false);
                  }}
                />
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    onEdit?.({ ...message, content: draft });
                    setEditing(false);
                  }}
                >
                  Save
                </Button>
              </div>
            ) : message.type === MessageType.TEXT ? (
              <p className="break-words whitespace-pre-wrap">{message.content}</p>
            ) : (
              <AttachmentMessageContent
                type={message.type}
                mediaUrl={message.mediaUrl || ""}
                fileName={message.fileName}
                variant={isOwn ? "outgoing" : "incoming"}
              />
            )}

            {!isDeleted && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-1 text-[11px]",
                  isOwn ? "text-primary-foreground/75 justify-end" : "text-muted-foreground",
                )}
              >
                {message.isEdited && <span>edited</span>}
                <span>{formatMessageTime(message.createdAt)}</span>
                {isOwn && (
                  <MessageStatusTicks
                    status={message.status}
                    clientState={message.clientState}
                  />
                )}
              </div>
            )}
          </div>

          {isFailed && onRetry && (
            <button
              onClick={() => onRetry(message)}
              className="flex items-center justify-center rounded-full size-6 bg-destructive text-destructive-foreground shrink-0"
              aria-label="Retry sending"
            >
              <RotateCcw className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
