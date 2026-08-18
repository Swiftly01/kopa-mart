// import { useEffect, useRef } from "react";
// import type { CallPhase } from "@/context/CallContext";
// import { CallType } from "@/types/chat";

// const NOTIFICATION_TAG = "incoming-call";

// // A gentle "buzz-buzz...pause" pattern, matching the ringtone's cadence
// // roughly. Re-used both for the direct navigator.vibrate() calls (works
// // while the tab is visible/foregrounded) and for the `vibrate` option
// // passed to a service-worker notification (works while backgrounded on
// // Android — iOS Safari doesn't support notification vibration or
// // navigator.vibrate at all, so this is a no-op there rather than a bug).
// const VIBRATE_PATTERN = [300, 150, 300, 150, 300, 600];

// async function closeExistingCallNotification() {
//   if (!("serviceWorker" in navigator)) return;
//   try {
//     const registration = await navigator.serviceWorker.ready;
//     const existing = await registration.getNotifications({
//       tag: NOTIFICATION_TAG,
//     });
//     existing.forEach((n) => n.close());
//   } catch {
//     // No active service worker / not supported — nothing to clean up.
//   }
// }

// async function showIncomingCallNotification(
//   peerName: string,
//   type: CallType,
// ) {
//   if (typeof window === "undefined") return;
//   if (!("Notification" in window) || Notification.permission !== "granted")
//     return;
//   if (!("serviceWorker" in navigator)) return;

//   try {
//     const registration = await navigator.serviceWorker.ready;
//     await registration.showNotification(
//       `Incoming ${type === CallType.VIDEO ? "video" : "voice"} call`,
//       {
//         body: `${peerName} is calling you`,
//         tag: NOTIFICATION_TAG,
//         renotify: true,
//         requireInteraction: true,
//         icon: "/icons/icon-192.png",
//         badge: "/icons/badge-72.png",
//         vibrate: VIBRATE_PATTERN,
//         data: { url: "/messages" },
//       } as NotificationOptions,
//     );
//   } catch {
//     // Notification permission can still be revoked mid-flight, the SW
//     // registration can fail, etc. — a missed system notification isn't
//     // worth surfacing an error for, the in-app ringtone/screen still covers
//     // it whenever the tab is actually visible.
//   }
// }

// /**
//  * Complements `useCallSound`: while a call is "ringing" (incoming), this
//  * also vibrates the device and — if the tab is in the background — raises
//  * an OS-level notification, so the person isn't relying on hearing the
//  * ringtone from a backgrounded/muted tab. Fully additive: safe to no-op on
//  * browsers without Notification/vibrate support (e.g. iOS Safari).
//  */
// export function useCallNotification(
//   phase: CallPhase | undefined,
//   peerName: string | undefined,
//   type: CallType | undefined,
// ) {
//   const vibrateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
//     null,
//   );
//   const notifiedRef = useRef(false);

//   useEffect(() => {
//     const stopVibrating = () => {
//       if (vibrateIntervalRef.current) {
//         clearInterval(vibrateIntervalRef.current);
//         vibrateIntervalRef.current = null;
//       }
//       navigator.vibrate?.(0);
//     };

//     if (phase === "ringing" && peerName && type) {
//       // Direct vibration — only has an effect while the tab is visible,
//       // but costs nothing to call regardless.
//       navigator.vibrate?.(VIBRATE_PATTERN);
//       vibrateIntervalRef.current = setInterval(() => {
//         navigator.vibrate?.(VIBRATE_PATTERN);
//       }, 2500);

//       if (document.hidden) {
//         notifiedRef.current = true;
//         void showIncomingCallNotification(peerName, type);
//       }
//     } else {
//       stopVibrating();
//       if (notifiedRef.current) {
//         notifiedRef.current = false;
//         void closeExistingCallNotification();
//       }
//     }

//     return stopVibrating;
//   }, [phase, peerName, type]);

//   // If the person switches back to the tab mid-ring, the in-app
//   // IncomingCallScreen is now visible — the OS notification is redundant,
//   // so clear it. If they leave again while it's still ringing, the effect
//   // above re-fires (phase hasn't changed, but this listener is independent)
//   // — handled by re-checking document.hidden on the next phase transition,
//   // which is good enough here since ringing is short-lived (~30s).
//   useEffect(() => {
//     const onVisibilityChange = () => {
//       if (!document.hidden && notifiedRef.current) {
//         notifiedRef.current = false;
//         void closeExistingCallNotification();
//       }
//     };
//     document.addEventListener("visibilitychange", onVisibilityChange);
//     return () =>
//       document.removeEventListener("visibilitychange", onVisibilityChange);
//   }, []);
// }


import { useEffect, useRef } from "react";
import type { CallPhase } from "@/context/CallContext";
import { CallType } from "@/types/chat";

const NOTIFICATION_TAG = "incoming-call";

// A gentle "buzz-buzz...pause" pattern, matching the ringtone's cadence
// roughly. Re-used both for the direct navigator.vibrate() calls (works
// while the tab is visible/foregrounded) and for the `vibrate` option
// passed to a service-worker notification (works while backgrounded on
// Android — iOS Safari doesn't support notification vibration or
// navigator.vibrate at all, so this is a no-op there rather than a bug).
const VIBRATE_PATTERN = [300, 150, 300, 150, 300, 600];

async function closeExistingCallNotification() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.getNotifications({
      tag: NOTIFICATION_TAG,
    });
    existing.forEach((n) => n.close());
  } catch {
    // No active service worker / not supported — nothing to clean up.
  }
}

async function showIncomingCallNotification(
  peerName: string,
  type: CallType,
) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(
      `Incoming ${type === CallType.VIDEO ? "video" : "voice"} call`,
      {
        body: `${peerName} is calling you`,
        tag: NOTIFICATION_TAG,
        renotify: true,
        requireInteraction: true,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-72.png",
        vibrate: VIBRATE_PATTERN,
        data: { url: "/messages" },
      } as NotificationOptions,
    );
  } catch {
    // Notification permission can still be revoked mid-flight, the SW
    // registration can fail, etc. — a missed system notification isn't
    // worth surfacing an error for, the in-app ringtone/screen still covers
    // it whenever the tab is actually visible.
  }
}

/**
 * Complements `useCallSound`: while a call is "ringing" (incoming), this
 * also vibrates the device and — if the tab is in the background — raises
 * an OS-level notification, so the person isn't relying on hearing the
 * ringtone from a backgrounded/muted tab. Fully additive: safe to no-op on
 * browsers without Notification/vibrate support (e.g. iOS Safari).
 */
export function useCallNotification(
  phase: CallPhase | undefined,
  peerName: string | undefined,
  type: CallType | undefined,
) {
  const vibrateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const notifiedRef = useRef(false);

  useEffect(() => {
    const stopVibrating = () => {
      if (vibrateIntervalRef.current) {
        clearInterval(vibrateIntervalRef.current);
        vibrateIntervalRef.current = null;
      }
      navigator.vibrate?.(0);
    };

    if (phase === "ringing" && peerName && type) {
      // Direct vibration — only has an effect while the tab is visible,
      // but costs nothing to call regardless.
      navigator.vibrate?.(VIBRATE_PATTERN);
      vibrateIntervalRef.current = setInterval(() => {
        navigator.vibrate?.(VIBRATE_PATTERN);
      }, 2500);

      if (document.hidden) {
        notifiedRef.current = true;
        void showIncomingCallNotification(peerName, type);
      }
    } else {
      stopVibrating();
      if (notifiedRef.current) {
        notifiedRef.current = false;
        void closeExistingCallNotification();
      }
    }

    return stopVibrating;
  }, [phase, peerName, type]);

  // If the person switches back to the tab mid-ring, the in-app
  // IncomingCallScreen is now visible — the OS notification is redundant,
  // so clear it. If they leave again while it's still ringing, the effect
  // above re-fires (phase hasn't changed, but this listener is independent)
  // — handled by re-checking document.hidden on the next phase transition,
  // which is good enough here since ringing is short-lived (~30s).
  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden && notifiedRef.current) {
        notifiedRef.current = false;
        void closeExistingCallNotification();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);
}
