import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Phone, Video, MoreVertical, Users } from "lucide-react";
import { getInitials } from "./chatDateUtils";
import { Conversation, ConversationType } from "@/types/chat";

export function ChatHeader({
  conversation,
  currentUserId,
  isOnline,
  typingLabel,
  onStartCall,
  onDelete,
}: {
  conversation: Conversation;
  currentUserId?: string;
  isOnline: boolean;
  typingLabel?: string;
  onStartCall: (type: "voice" | "video") => void;
  onDelete: () => void;
}) {
  const navigate = useNavigate();
  const isGroup = conversation.type === ConversationType.GROUP;
  const other = conversation.participants?.find((p) => p.userId !== currentUserId)?.user;

  const title = isGroup
    ? conversation.name || "Group chat"
    : other
      ? `${other.firstName} ${other.lastName}`.trim()
      : "Conversation";

  const subtitle = typingLabel
    ? typingLabel
    : isGroup
      ? `${conversation.participants?.filter((p) => !p.leftAt).length ?? 0} members`
      : isOnline
        ? "Online"
        : "Offline";

  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2.5 border-b border-border bg-background/95 backdrop-blur-lg">
      <button
        onClick={() => navigate("/messages")}
        className="flex items-center justify-center rounded-full size-9 shrink-0 hover:bg-muted"
        aria-label="Back to conversations"
      >
        <ArrowLeft className="size-5" />
      </button>

      <div className="flex items-center flex-1 min-w-0 gap-2.5">
        <Avatar className="size-9">
          <AvatarImage
            src={other?.profilePictureThumbnailUrl || other?.profilePictureUrl || undefined}
          />
          <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
            {isGroup ? <Users className="size-4" /> : getInitials(other?.firstName, other?.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-tight truncate">{title}</p>
          <p
            className={`text-xs leading-tight truncate ${
              typingLabel ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <button
        onClick={() => onStartCall("voice")}
        className="flex items-center justify-center rounded-full size-9 shrink-0 hover:bg-muted"
        aria-label="Voice call"
      >
        <Phone className="size-[18px]" />
      </button>
      <button
        onClick={() => onStartCall("video")}
        className="flex items-center justify-center rounded-full size-9 shrink-0 hover:bg-muted"
        aria-label="Video call"
      >
        <Video className="size-5" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center justify-center rounded-full size-9 shrink-0 hover:bg-muted"
            aria-label="More options"
          >
            <MoreVertical className="size-[18px]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isGroup && other && (
            <DropdownMenuItem onClick={() => navigate(`/seller/${other.id}`)}>
              View profile
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
            {isGroup ? "Delete conversation" : "Delete chat"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
