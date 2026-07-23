// import { useEffect } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import useUser from "@/hooks/users/queries/useUser";
// import { subscribeToForegroundMessages } from "@/lib/push/firebaseMessaging";

// import appToast from "@/lib/appToast";
// import { notificationKeys } from "@/hooks/notifications/notificationKey";

// export default function NotificationPushListener() {
//   const { data: user } = useUser();
//   const queryClient = useQueryClient();

//   useEffect(() => {
//     if (!user) return;

//     let unsubscribe: (() => void) | null = null;
//     let cancelled = false;

//     subscribeToForegroundMessages((payload) => {
//       if (Notification.permission !== "granted") return;

//       const notification = new Notification(
//         payload.notification?.title ?? "KopaMart",
//         {
//           body: payload.notification?.body,
//           icon: "/icons/icon-192.png",
//           image: payload.data?.image,
//         } as NotificationOptions,
//       );

//       notification.onclick = () => {
//         window.focus();
//         window.location.href = payload.data?.url ?? "/notifications";
//       };

//       queryClient.invalidateQueries({
//         queryKey: notificationKeys.lists(),
//       });
//     })
//       .then((unsub) => {
//         if (cancelled) {
//           unsub?.();
//         } else {
//           unsubscribe = unsub;
//         }
//       })
//       .catch((err) => console.log(err));

//     return () => {
//       cancelled = true;
//       unsubscribe?.();
//     };
//   }, [user, queryClient]);

//   return null;
// }

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

      // Always refresh in-app data, regardless of OS notification permission.
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });

      // In-app toast: works regardless of permission/platform.
      appToast({
        title,
        description: body,
        // onClick: () => {
        //   window.location.href = url;
        // },
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
