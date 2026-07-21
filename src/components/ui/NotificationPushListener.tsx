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
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });

      console.log(payload);

      const title = payload.notification?.title ?? "New notification";
      const body = payload.notification?.body;
      // appToast({ title, description: body });
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
