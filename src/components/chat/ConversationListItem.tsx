import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OnlineDot } from "./OnlineDot";
import { UnreadBadge } from "./UnreadBadge";
import { getInitials } from "./chatDateUtils";
import { formatRelativeTime } from "@/lib/utils/formatRelativeTime";
import { cn } from "@/lib/utils/utils";
import { Conversation, ConversationType, MessageType } from "@/types/chat";
import { Users, Image as ImageIcon, Mic, FileText } from "lucide-react";

function previewIcon(type: MessageType | null) {
  switch (type) {
    case MessageType.IMAGE:
      return <ImageIcon className="inline size-3.5 -mt-0.5 mr-1" />;
    case MessageType.AUDIO:
      return <Mic className="inline size-3.5 -mt-0.5 mr-1" />;
    case MessageType.FILE:
      return <FileText className="inline size-3.5 -mt-0.5 mr-1" />;
    default:
      return null;
  }
}

function previewLabel(conversation: Conversation): string {
  if (conversation.lastMessageType === MessageType.IMAGE) return "Photo";
  if (conversation.lastMessageType === MessageType.AUDIO) return "Voice message";
  if (conversation.lastMessageType === MessageType.FILE)
    return conversation.lastMessageFileName || "File";
  return conversation.lastMessagePreview || "No messages yet";
}

export function ConversationListItem({
  conversation,
  currentUserId,
  isOnline,
  unreadCount,
}: {
  conversation: Conversation;
  currentUserId?: string;
  isOnline: boolean;
  unreadCount: number;
}) {
  const isGroup = conversation.type === ConversationType.GROUP;
  const other = conversation.participants?.find(
    (p) => p.userId !== currentUserId,
  )?.user;

  const title = isGroup
    ? conversation.name || "Group chat"
    : other
      ? `${other.firstName} ${other.lastName}`.trim()
      : "Conversation";

  const avatarUrl = isGroup
    ? undefined
    : other?.profilePictureThumbnailUrl || other?.profilePictureUrl || undefined;

  return (
    <Link
      to={`/messages/${conversation.id}`}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60 active:bg-muted"
    >
      <div className="relative shrink-0">
        <Avatar className="size-[52px]">
          <AvatarImage src={avatarUrl} alt={title} />
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            {isGroup ? <Users className="size-5" /> : getInitials(other?.firstName, other?.lastName)}
          </AvatarFallback>
        </Avatar>
        {!isGroup && <OnlineDot online={isOnline} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-[15px]",
              unreadCount > 0 ? "font-semibold text-foreground" : "font-medium text-foreground",
            )}
          >
            {title}
          </span>
          {conversation.lastMessageAt && (
            <span
              className={cn(
                "shrink-0 text-xs",
                unreadCount > 0 ? "text-primary font-semibold" : "text-muted-foreground",
              )}
            >
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              "truncate text-sm",
              unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground",
            )}
          >
            {previewIcon(conversation.lastMessageType)}
            {previewLabel(conversation)}
          </p>
          <UnreadBadge count={unreadCount} />
        </div>
      </div>
    </Link>
  );
}
