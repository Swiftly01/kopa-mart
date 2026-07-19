import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useNotificationPreferences from "@/hooks/notifications/queries/useNotificationPreferences";
import { NotificationChannel } from "@/types/notification";
import useUpdateNotificationPreference from "@/hooks/notifications/mutation/useUpdateNotificationPreference";

interface NotificationPreferencesModalProps {
  open: boolean;
  onClose: () => void;
}

const CHANNEL_COPY: Record<
  NotificationChannel,
  { title: string; description: string }
> = {
  [NotificationChannel.EMAIL]: {
    title: "Email",
    description: "Order receipts and account updates",
  },
  [NotificationChannel.SMS]: {
    title: "SMS",
    description: "OTPs and urgent order updates",
  },
  [NotificationChannel.PUSH]: {
    title: "Push",
    description: "Real-time alerts on this device",
  },
};

export default function NotificationPreferencesModal({
  open,
  onClose,
}: NotificationPreferencesModalProps) {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const { mutate: updatePreference } = useUpdateNotificationPreference();

  
  const [quietHoursStart, setQuietHoursStart] = useState("");
  const [quietHoursEnd, setQuietHoursEnd] = useState("");

  useEffect(() => {
    const withQuietHours = preferences?.find(
      (p) => p.quietHoursStart && p.quietHoursEnd,
    );
    setQuietHoursStart(withQuietHours?.quietHoursStart ?? "");
    setQuietHoursEnd(withQuietHours?.quietHoursEnd ?? "");
  }, [preferences]);

  // Absence of a row means "enabled" — matches the backend default (see
  // NotificationPreferenceService.getEnabledChannels).
  const isEnabled = (channel: NotificationChannel) =>
    preferences?.find((p) => p.channel === channel)?.enabled ?? true;

  const handleToggle = (channel: NotificationChannel, enabled: boolean) => {
    updatePreference({
      channel,
      enabled,
      quietHoursStart: quietHoursStart || undefined,
      quietHoursEnd: quietHoursEnd || undefined,
    });
  };

  const applyQuietHoursToEnabledChannels = () => {
    if (!quietHoursStart || !quietHoursEnd) return;
    Object.values(NotificationChannel).forEach((channel) => {
      if (!isEnabled(channel)) return;
      updatePreference({
        channel,
        enabled: true,
        quietHoursStart,
        quietHoursEnd,
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin size-6 text-primary" />
          </div>
        ) : (
          <div className="pt-2 space-y-5">
            <div className="space-y-2">
              {Object.values(NotificationChannel).map((channel) => (
                <div
                  key={channel}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {CHANNEL_COPY[channel].title}
                    </p>
                    <p className="text-xs truncate text-muted-foreground">
                      {CHANNEL_COPY[channel].description}
                    </p>
                  </div>
                  <Switch
                    checked={isEnabled(channel)}
                    onCheckedChange={(checked) => handleToggle(channel, checked)}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Quiet Hours (optional)</Label>
              <p className="text-xs text-muted-foreground">
                Non-urgent notifications won't be sent during this window.
                Security codes and order alerts still come through.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  onBlur={applyQuietHoursToEnabledChannels}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  onBlur={applyQuietHoursToEnabledChannels}
                  className="flex-1"
                />
              </div>
            </div>

            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
