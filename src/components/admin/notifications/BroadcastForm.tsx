import { useState } from "react";
import { Loader2, Megaphone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import UserPicker from "./UserPicker";
import useBroadcastNotification from "@/hooks/admin/notifications/mutations/useBroadcastNotification";
import useEstimateBroadcastAudience from "@/hooks/admin/notifications/queries/useEstimateBroadcastAudience";
import { NotificationChannel, NotificationType } from "@/types/notification";
import {
  BroadcastAudience,
  NotificationPriority,
} from "@/types/adminNotification";

import appToast from "@/lib/appToast";
import { UserRoleEnum } from "@/types/user";
import RichTextEditor from "../ui/RichTextEditor";

const TYPE_LABELS: Partial<Record<NotificationType, string>> = {
  [NotificationType.PROMOTION_ALERT]: "Promotion",
  [NotificationType.PRICE_DROP_ALERT]: "Price Drop Alert",
  [NotificationType.GENERIC]: "Generic Announcement",
};

const BROADCAST_ELIGIBLE_TYPES = [
  NotificationType.PROMOTION_ALERT,
  NotificationType.PRICE_DROP_ALERT,
  NotificationType.GENERIC,
];

const ALL_CHANNELS = Object.values(NotificationChannel);

/**
 * "No filter" is represented as `undefined` in the actual DTO, but native
 * <select>/shadcn Select need a real string value for every option — this
 * sentinel is translated back to `undefined` at the point it's read, never
 * sent to the backend as a literal string.
 */
const NO_ROLE_FILTER = "__all_roles__";

const ROLE_LABELS: Record<UserRoleEnum, string> = {
  [UserRoleEnum.BUYER]: "Buyers only",
  [UserRoleEnum.SELLER]: "Sellers only",
  [UserRoleEnum.ADMIN]: "Admins only",
};

export default function BroadcastForm() {
  const [audience, setAudience] = useState<BroadcastAudience>(
    BroadcastAudience.ALL,
  );
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<UserRoleEnum | undefined>(undefined);
  const [type, setType] = useState<NotificationType>(
    NotificationType.PROMOTION_ALERT,
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [channels, setChannels] = useState<NotificationChannel[]>([
    NotificationChannel.EMAIL,
  ]);
  const [priority, setPriority] = useState<NotificationPriority>(
    NotificationPriority.LOW,
  );
  const [scheduledFor, setScheduledFor] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [totalQueued, setTotalQueued] = useState<number | null>(null);

  const { mutate: broadcast, isPending } = useBroadcastNotification();

  // Fetched only to show "this will reach ~N users" on the confirm step —
  // uses the dedicated backend estimate endpoint (a single COUNT query),
  // not the user-search endpoint, since we only need a number here.
  // Re-queries whenever roleFilter changes too (different query key via
  // the params object), so switching "All Users" → "Sellers only" updates
  // the estimate rather than showing a stale total-user-base count.
  const { data: allUsersCount } = useEstimateBroadcastAudience(
    { audience: BroadcastAudience.ALL, roleFilter },
    audience === BroadcastAudience.ALL,
  );

  const toggleChannel = (channel: NotificationChannel) => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    );
  };

  const validate = (): string | null => {
    if (!body.trim()) return "Message body is required.";
    if (channels.length === 0) return "Select at least one channel.";
    if (
      audience === BroadcastAudience.SPECIFIC &&
      selectedUserIds.length === 0
    ) {
      return "Select at least one recipient, or switch to 'All Users'.";
    }
    return null;
  };

  const handleReviewClick = () => {
    const error = validate();
    if (error) {
      appToast({ title: error, variant: "destructive" });
      return;
    }
    setConfirming(true);
  };

  const handleConfirmSend = () => {
    broadcast(
      {
        audience,
        userIds:
          audience === BroadcastAudience.SPECIFIC ? selectedUserIds : undefined,
        roleFilter: audience === BroadcastAudience.ALL ? roleFilter : undefined,
        type,
        title: title || undefined,
        body,
        // Backend only reads bodyHtml for the EMAIL channel (see
        // BaseChannelProcessor's html precedence) — harmless to include
        // even when EMAIL isn't selected, so no need to conditionally
        // strip it based on the channel selection here.
        bodyHtml: bodyHtml || undefined,
        channels,
        priority,
        scheduledFor: scheduledFor
          ? new Date(scheduledFor).toISOString()
          : undefined,
      },
      {
        onSuccess: (result) => {
          setTotalQueued(result.totalQueued);
          setConfirming(false);
          appToast({
            title: `Broadcast queued for ${result.totalQueued} user(s)`,
          });
        },
        onError: (err: any) => {
          setConfirming(false);
          appToast({
            title: "Broadcast failed",
            description: err?.response?.data?.message ?? "Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const recipientDescription =
    audience === BroadcastAudience.ALL
      ? allUsersCount !== undefined
        ? `~${allUsersCount} user(s)${roleFilter ? ` (${ROLE_LABELS[roleFilter].toLowerCase()})` : " — your entire user base"}`
        : roleFilter
          ? ROLE_LABELS[roleFilter]
          : "Your entire user base"
      : `${selectedUserIds.length} selected user(s)`;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 p-3 text-xs border rounded-lg border-warning/30 bg-warning/10 text-warning">
        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
        <p>
          Broadcasts skip each user's normal preference-based channel fallback —
          you're choosing the channel(s) explicitly. Use "Low" priority for
          anything promotional so it still respects quiet hours.
        </p>
      </div>

      {/* Audience */}
      <div className="space-y-2">
        <Label>Audience</Label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              [BroadcastAudience.ALL, "All Users"],
              [BroadcastAudience.SPECIFIC, "Specific Users"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setAudience(value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                audience === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {audience === BroadcastAudience.ALL && (
        <div className="space-y-1">
          <Label>Limit to a role (optional)</Label>
          <Select
            value={roleFilter ?? NO_ROLE_FILTER}
            onValueChange={(v) =>
              setRoleFilter(v === NO_ROLE_FILTER ? undefined : (v as UserRoleEnum))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_ROLE_FILTER}>
                Every active user (no filter)
              </SelectItem>
              {Object.values(UserRoleEnum).map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {audience === BroadcastAudience.SPECIFIC && (
        <UserPicker
          selectedIds={selectedUserIds}
          onChange={setSelectedUserIds}
        />
      )}

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
              {BROADCAST_ELIGIBLE_TYPES.map((t) => (
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
            onValueChange={(v) =>
              setPriority(Number(v) as NotificationPriority)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={String(NotificationPriority.LOW)}>
                Low (respects quiet hours)
              </SelectItem>
              <SelectItem value={String(NotificationPriority.NORMAL)}>
                Normal
              </SelectItem>
              <SelectItem value={String(NotificationPriority.HIGH)}>
                High
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Title + Body */}
      <div className="space-y-1">
        <Label htmlFor="broadcastTitle">Title</Label>
        <Input
          id="broadcastTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. 20% off this weekend"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="broadcastBody">Message</Label>
        <RichTextEditor
          value={bodyHtml}
          onChange={(html, plainText) => {
            setBodyHtml(html);
            setBody(plainText);
          }}
          placeholder="The message every recipient will see"
        />
        {channels.includes(NotificationChannel.SMS) && (
          <p
            className={`text-xs ${
              body.length > 160 ? "text-warning" : "text-muted-foreground"
            }`}
          >
            {body.length} characters — SMS is sent as plain text (formatting is
            stripped)
            {body.length > 160
              ? "; this will send as multiple SMS segments"
              : ""}
            .
          </p>
        )}
      </div>

      {/* Channels — required */}
      <div className="space-y-1.5">
        <Label>Channels</Label>
        <div className="flex gap-4">
          {ALL_CHANNELS.map((channel) => (
            <label
              key={channel}
              className="flex items-center gap-2 text-sm capitalize"
            >
              <Checkbox
                checked={channels.includes(channel)}
                onCheckedChange={() => toggleChannel(channel)}
              />
              {channel}
            </label>
          ))}
        </div>
      </div>

      {/* Scheduled for */}
      <div className="space-y-1">
        <Label htmlFor="broadcastScheduledFor">Send at (optional)</Label>
        <Input
          id="broadcastScheduledFor"
          type="datetime-local"
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
        />
      </div>

      {!confirming ? (
        <Button onClick={handleReviewClick} className="gap-2">
          <Megaphone className="size-4" />
          Review broadcast
        </Button>
      ) : (
        <div className="p-4 space-y-3 border rounded-lg border-primary/30 bg-primary/5">
          <p className="text-sm font-medium">Confirm broadcast</p>
          <p className="text-xs text-muted-foreground">
            This will send to{" "}
            <span className="font-medium text-foreground">
              {recipientDescription}
            </span>{" "}
            via{" "}
            <span className="font-medium text-foreground">
              {channels.join(", ")}
            </span>
            . This can't be undone once sent.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirming(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSend}
              disabled={isPending}
              className="gap-2"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              Confirm & send
            </Button>
          </div>
        </div>
      )}

      {totalQueued !== null && !confirming && (
        <div className="p-4 border rounded-lg border-border bg-secondary/30">
          <p className="text-sm">
            Queued for <span className="font-medium">{totalQueued}</span>{" "}
            user(s). Delivery happens asynchronously — check the Dead Letter
            Queue tab for any that fail.
          </p>
        </div>
      )}
    </div>
  );
}
