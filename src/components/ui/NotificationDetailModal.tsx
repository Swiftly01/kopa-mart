import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Copy, ExternalLink, Link2, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/types/notification";
import { getNotificationVisual } from "@/lib/utils/notificationVisuals";
import { formatNotificationDate } from "@/lib/utils/formatRelativeTime";
import {
  getNotificationDetailEntries,
  getNotificationImage,
  getNotificationLink,
} from "@/lib/utils/notificationLink";

interface NotificationDetailModalProps {
  /** The notification to show — the modal is open whenever this isn't null. */
  notification: NotificationItem | null;
  onClose: () => void;
  onToggleRead?: (notification: NotificationItem) => void;
  onDelete?: (notification: NotificationItem) => void;
}

function humanizeType(type: string): string {
  return type
    .replace(/[_-]+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

export default function NotificationDetailModal({
  notification,
  onClose,
  onToggleRead,
  onDelete,
}: NotificationDetailModalProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  if (!notification) return null;

  const { icon: Icon, className: iconClassName } =
    getNotificationVisual(notification);
  const link = getNotificationLink(notification);
  const image = getNotificationImage(notification);
  const entries = getNotificationDetailEntries(notification);
  const isUnread = !notification.readAt;

  

  const handleOpenLink = () => {
    if (!link) return;
    if (link.isExternal) {
      window.open(link.href, "_blank", "noopener,noreferrer");
    } else {
      onClose();
      navigate(link.href);
    }
  };

  const handleCopyLink = async () => {
    if (!link) return;
    const absolute =
      link.isExternal || typeof window === "undefined"
        ? link.href
        : `${window.location.origin}${link.href}`;
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable (insecure context / denied) — silently ignore */
    }
  };

  return (
    <Dialog
      open={Boolean(notification)}
      onOpenChange={(open) => {
        if (!open) {
          setCopied(false);
          onClose();
        }
      }}
    >
      <DialogContent
        className="w-[calc(100vw-2rem)] max-w-md rounded-2xl p-4 sm:p-6
          max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6 text-left">
            <div
              className={`flex items-center justify-center shrink-0 size-10 rounded-xl ${iconClassName}`}
            >
              <Icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base leading-snug break-words">
                {notification.title ?? "Notification"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                {formatNotificationDate(notification.createdAt)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-[10px] font-medium">
            {humanizeType(notification.type)}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-medium uppercase">
            {notification.channel}
          </Badge>
          {isUnread && (
            <Badge className="text-[10px] font-medium">Unread</Badge>
          )}
        </div>

        {notification.body && (
          <p className="text-sm whitespace-pre-line break-words text-foreground/90">
            {notification.body}
          </p>
        )}

        {/* ── Image ──────────────────────────────────────────────────────── */}
        {image && !imageFailed && (
          <img
            src={image}
            alt={notification.title ?? "Notification image"}
            onError={() => setImageFailed(true)}
            className="w-full max-h-48 object-cover rounded-xl border"
          />
        )}

        {/* ── Link ───────────────────────────────────────────────────────── */}
        {link && (
          <div className="p-3 space-y-2 border rounded-xl bg-muted/40 min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
              <Link2 className="size-3.5 shrink-0" />
              <span className="truncate" title={link.href}>
                {link.href}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 min-w-0" onClick={handleOpenLink}>
                <span className="truncate">{link.label}</span>
                {link.isExternal && <ExternalLink className="size-3.5 shrink-0" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={handleCopyLink}
                title="Copy link"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
          </div>
        )}

        {/* ── Extra payload fields ───────────────────────────────────────── */}
        {entries.length > 0 && (
          <dl className="divide-y rounded-xl border overflow-hidden">
            {entries.map((entry) => (
              <div key={entry.key} className="px-3 py-2 space-y-0.5 min-w-0">
                <dt className="text-[11px] text-muted-foreground">
                  {entry.label}
                </dt>
                {entry.href ? (
                  <dd className="text-xs font-medium min-w-0">
                    <a
                      href={entry.href}
                      target={entry.href.startsWith("http") ? "_blank" : undefined}
                      rel={entry.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-primary underline-offset-2 hover:underline break-all"
                    >
                      {entry.value}
                    </a>
                  </dd>
                ) : (
                  <dd className="text-xs font-medium break-all min-w-0">
                    {entry.value}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        )}

        {!link && !image && entries.length === 0 && !notification.body && (
          <p className="text-xs text-muted-foreground">
            No extra details for this notification.
          </p>
        )}

        {/* ── Footer actions ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {onToggleRead ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleRead(notification)}
            >
              <Check className="size-3.5" />
              {isUnread ? "Mark as read" : "Mark as unread"}
            </Button>
          ) : (
            <span />
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                onDelete(notification);
                onClose();
              }}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}