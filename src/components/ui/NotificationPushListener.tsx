

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useUser from "@/hooks/users/queries/useUser";
import { subscribeToForegroundMessages } from "@/lib/push/firebaseMessaging";

import appToast from "@/lib/appToast";
import { notificationKeys } from "@/hooks/notifications/notificationKey";

export default function NotificationPushListener() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    subscribeToForegroundMessages((payload) => {
      const data = payload.data ?? {};
      const title = data.title ?? payload.notification?.title ?? "KopaMart";
      const body = data.body ?? payload.notification?.body;
      const url = data.url ?? "/notifications";

    
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });

      
      appToast({
        title,
        description: body,
        
      });

    
      if (
        Notification.permission === "granted" &&
        "serviceWorker" in navigator
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: "/icons/icon-192.png",
            badge: "/icons/badge-72.png",
            image: data.image,
            data,
          } as NotificationOptions);
        });
      }
    })
      .then((unsub) => {
        if (cancelled) {
          unsub?.();
        } else {
          unsubscribe = unsub;
        }
      })
      .catch((err) => console.log(err));

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user, queryClient]);

  return null;
}
