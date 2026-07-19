import { Check, Trash2 } from "lucide-react";
import { NotificationItem } from "@/types/notification";
import { getNotificationVisual } from "@/lib/utils/notificationVisuals";
import { formatNotificationDate, formatRelativeTime } from "@/lib/utils/formatRelativeTime";

interface NotificationCardProps {
  notification: NotificationItem;
  onOpen: (notification: NotificationItem) => void;
  onToggleRead: (notification: NotificationItem) => void;
  onDelete: (notification: NotificationItem) => void;
}

export default function NotificationCard({
  notification,
  onOpen,
  onToggleRead,
  onDelete,
}: NotificationCardProps) {
  const isUnread = !notification.readAt;
  const { icon: Icon, className: iconClassName } = getNotificationVisual(
    notification.type,
    notification.channel,
  );

  

  return (
    <div
      onClick={() => onOpen(notification)}
      className={`relative flex items-start gap-3 p-4 card-listing cursor-pointer transition-colors ${
        isUnread ? "bg-primary/[0.04]" : ""
      }`}
    >
      {isUnread && (
        <span className="absolute inline-flex rounded-full top-4 left-1.2 size-1.5 bg-primary" />
      )}

      <div
        className={`flex items-center justify-center shrink-0 size-10 rounded-xl ${iconClassName}`}
      >
        <Icon className="size-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm truncate ${isUnread ? "font-semibold" : "font-medium text-foreground/90"}`}
          >
            {notification.title ?? "Notification"}
          </p>
          <span className="text-xs shrink-0 text-muted-foreground">
            {formatNotificationDate(notification.createdAt)}
          </span>
        </div>
        {notification.body && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {notification.body}
          </p>
        )}
      </div>

      {/* Action buttons — stopPropagation so tapping them doesn't also trigger onOpen */}
      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleRead(notification);
          }}
          title={isUnread ? "Mark as read" : "Mark as unread"}
          className={`flex items-center justify-center rounded-full size-7 transition-colors hover:bg-muted ${
            isUnread ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Check className="size-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification);
          }}
          title="Delete"
          className="flex items-center justify-center transition-colors rounded-full size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
