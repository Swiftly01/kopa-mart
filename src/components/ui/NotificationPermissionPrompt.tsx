import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useUser from "@/hooks/users/queries/useUser";
import { requestPushToken } from "@/lib/push/firebaseMessaging";
import { DevicePlatform } from "@/types/notification";
import appToast from "@/lib/appToast";
import useRegisterDeviceToken from "@/hooks/notifications/mutation/useRegisterDeviceToken";

const DISMISSED_AT_KEY = "notificationPromptDismissedAt";
const RE_PROMPT_AFTER_DAYS = 14;

export default function NotificationPermissionPrompt() {
  const { data: user } = useUser();
  const { mutate: registerDeviceToken, isPending: isRegistering } =
    useRegisterDeviceToken();
  const [open, setOpen] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const isPending = isRequestingPermission || isRegistering;

  useEffect(() => {
    if (!user) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (
      Notification.permission === "granted" ||
      Notification.permission === "denied"
    ) {
      return;
    }

    const dismissedAt = localStorage.getItem(DISMISSED_AT_KEY);
    if (dismissedAt) {
      const daysSince =
        (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < RE_PROMPT_AFTER_DAYS) return;
    }

    const timer = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(timer);
  }, [user]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    setOpen(false);
  };

  const handleEnable = async () => {
    setIsRequestingPermission(true);
    try {
      const token = await requestPushToken();
     

      if (!token) {
        appToast({
          title: "Notifications not enabled",
          description:
            "You can turn this on anytime from your profile settings.",
        });
        setOpen(false);
        setIsRequestingPermission(false);
        return;
      }

      registerDeviceToken(
        { token, platform: DevicePlatform.WEB },
        {
          onSuccess: () => {
            appToast({ title: "Notifications enabled" });
            setOpen(false);
          },
          onError: () => {
            appToast({
              title: "Couldn't enable notifications",
              description: "Please try again from your profile settings.",
              variant: "destructive",
            });
            setOpen(false);
          },
          onSettled: () => setIsRequestingPermission(false),
        },
      );
    } catch (error) {
      console.log(error.response)
      console.error("Failed to enable notifications:", error);

      appToast({
        title: "Failed to enable notifications",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });

      setOpen(false);
      setIsRequestingPermission(false);
    }
  };
  

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleDismiss()}>
      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-center mx-auto rounded-full size-12 bg-primary/15 text-primary">
            <Bell className="size-6" />
          </div>
          <DialogTitle className="text-center">Stay in the loop</DialogTitle>
          <DialogDescription className="text-center">
            Turn on notifications for new product updates, price drops, and
            seller approvals.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={handleDismiss}>
            Not now
          </Button>
          <Button
            className="flex-1"
            onClick={handleEnable}
            disabled={isPending}
          >
            {isPending ? "Enabling..." : "Enable"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
