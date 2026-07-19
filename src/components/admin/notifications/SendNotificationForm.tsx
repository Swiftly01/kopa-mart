import { useState } from "react";
import { Loader2, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import useSendNotification from "@/hooks/admin/notifications/mutations/useSendNotification";
import useSendBulkNotifications from "@/hooks/admin/notifications/mutations/useSendBulkNotifications";
import { NotificationChannel, NotificationType } from "@/types/notification";
import {
  NotificationPriority,
  SendNotificationResult,
} from "@/types/adminNotification";
import appToast from "@/lib/appToast";

const TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.OTP_VERIFICATION]: "OTP Verification",
  [NotificationType.PASSWORD_RESET]: "Password Reset",
  [NotificationType.ORDER_CONFIRMATION]: "Order Confirmation",
  [NotificationType.ORDER_STATUS_UPDATE]: "Order Status Update",
  [NotificationType.SELLER_APPROVED]: "Seller Approved",
  [NotificationType.SELLER_REJECTED]: "Seller Rejected",
  [NotificationType.PRICE_DROP_ALERT]: "Price Drop Alert",
  [NotificationType.PROMOTION_ALERT]: "Promotion Alert",
  [NotificationType.GENERIC]: "Generic",
};

const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  [NotificationPriority.CRITICAL]: "Critical (bypasses quiet hours)",
  [NotificationPriority.HIGH]: "High",
  [NotificationPriority.NORMAL]: "Normal",
  [NotificationPriority.LOW]: "Low",
};

const ALL_CHANNELS = Object.values(NotificationChannel);

export default function SendNotificationForm() {
  const [isBulk, setIsBulk] = useState(false);
  const [userIdInput, setUserIdInput] = useState(""); // single id, or newline-separated in bulk mode
  const [type, setType] = useState<NotificationType>(NotificationType.GENERIC);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<NotificationChannel[]>([]);
  const [priority, setPriority] = useState<NotificationPriority>(
    NotificationPriority.NORMAL,
  );
  const [scheduledFor, setScheduledFor] = useState("");

  const [lastResult, setLastResult] = useState<
    SendNotificationResult | { queuedCount: number } | null
  >(null);

  const { mutate: send, isPending: isSending } = useSendNotification();
  const { mutate: sendBulk, isPending: isBulkSending } =
    useSendBulkNotifications();

  const isPending = isSending || isBulkSending;

  const toggleChannel = (channel: NotificationChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    );
  };

  const buildBaseDto = () => ({
    type,
    title: title || undefined,
    body,
    channels: selectedChannels.length > 0 ? selectedChannels : undefined,
    priority,
    // datetime-local gives "2026-07-16T10:30" — no seconds, no timezone,
    // which fails the backend's strict @IsDateString() check. Converting
    // via `new Date(...)` interprets it in the browser's local timezone
    // (what the admin actually intended) and produces a real ISO string.
    scheduledFor: scheduledFor
      ? new Date(scheduledFor).toISOString()
      : undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      appToast({
        title: "Message body is required",
        variant: "destructive",
      });
      return;
    }

    if (isBulk) {
      const userIds = userIdInput
        .split("\n")
        .map((id) => id.trim())
        .filter(Boolean);

      if (userIds.length === 0) {
        appToast({
          title: "Add at least one user ID",
          description: "One per line.",
          variant: "destructive",
        });
        return;
      }

      sendBulk(
        userIds.map((userId) => ({ userId, ...buildBaseDto() })),
        {
          onSuccess: (results) => {
            setLastResult({ queuedCount: results.length });
            appToast({ title: `Queued for ${results.length} user(s)` });
          },
          onError: () =>
            appToast({
              title: "Bulk send failed",
              description: "Please try again.",
              variant: "destructive",
            }),
        },
      );
      return;
    }

    const userId = userIdInput.trim();
    if (!userId) {
      appToast({ title: "User ID is required", variant: "destructive" });
      return;
    }

    send(
      { userId, ...buildBaseDto() },
      {
        onSuccess: (result) => {
          setLastResult(result);
          appToast({
            title:
              result.mode === "queued"
                ? "Notification queued"
                : "Sent synchronously (Redis unavailable)",
          });
        },
        onError: (err: any) =>
          appToast({
            title: "Send failed",
            description: err?.response?.data?.message ?? "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bulk toggle */}
        <button
          type="button"
          onClick={() => setIsBulk((v) => !v)}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <Users className="size-3.5" />
          {isBulk ? "Switch to single recipient" : "Switch to multiple recipients"}
        </button>

        {/* Recipient(s) */}
        <div className="space-y-1">
          <Label htmlFor="userId">
            {isBulk ? "User IDs (one per line)" : "User ID"}
          </Label>
          {isBulk ? (
            <Textarea
              id="userId"
              rows={4}
              placeholder={"9f2c1a...\nb7e4d0...\n..."}
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="font-mono text-xs"
            />
          ) : (
            <Input
              id="userId"
              placeholder="User UUID"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="font-mono text-xs"
            />
          )}
        </div>

        {/* Type + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as NotificationType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(NotificationType).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Priority</Label>
            <Select
              value={String(priority)}
              onValueChange={(v) => setPriority(Number(v) as NotificationPriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Shown as the notification title/subject"
          />
        </div>

        {/* Body */}
        <div className="space-y-1">
          <Label htmlFor="body">Message</Label>
          <Textarea
            id="body"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="The notification content"
          />
        </div>

        {/* Channels */}
        <div className="space-y-1.5">
          <Label>Channels (optional)</Label>
          <p className="text-xs text-muted-foreground">
            Leave all unchecked to use each recipient's own preferences.
          </p>
          <div className="flex gap-4">
            {ALL_CHANNELS.map((channel) => (
              <label
                key={channel}
                className="flex items-center gap-2 text-sm capitalize"
              >
                <Checkbox
                  checked={selectedChannels.includes(channel)}
                  onCheckedChange={() => toggleChannel(channel)}
                />
                {channel}
              </label>
            ))}
          </div>
        </div>

        {/* Scheduled for */}
        <div className="space-y-1">
          <Label htmlFor="scheduledFor">Send at (optional)</Label>
          <Input
            id="scheduledFor"
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {isBulk ? "Send to all" : "Send"}
        </Button>
      </form>

      {/* Result panel */}
      {lastResult && (
        <div className="p-4 space-y-2 border rounded-lg border-border bg-secondary/30">
          <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            Result
          </p>
          {"queuedCount" in lastResult ? (
            <p className="text-sm">
              Queued for {lastResult.queuedCount} user(s).
            </p>
          ) : lastResult.mode === "queued" ? (
            <p className="text-sm">
              Queued (request id:{" "}
              <span className="font-mono text-xs">
                {lastResult.notificationRequestId}
              </span>
              )
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-warning">
                Sent synchronously — Redis was unavailable, so this bypassed
                the queue (no retries applied).
              </p>
              {lastResult.channels.map((c) => (
                <div key={c.channel} className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-1.5 py-0.5 rounded-full font-medium capitalize ${
                      c.status === "sent"
                        ? "bg-success/15 text-success"
                        : c.status === "skipped"
                          ? "bg-muted text-muted-foreground"
                          : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {c.channel}: {c.status}
                  </span>
                  {c.error && (
                    <span className="text-muted-foreground">{c.error}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
