import { initializeApp, getApps } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  MessagePayload,
  onMessage,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

export async function requestPushToken(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const messaging = getMessaging(getFirebaseApp());

  await navigator.serviceWorker.register("/firebase-messaging-sw.js");

  const registration = await navigator.serviceWorker.ready;
  return getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
}

// export async function subscribeToForegroundMessages(
//   onPush: (payload: MessagePayload) => void,
// ): Promise<(() => void) | null> {
//   if (typeof window === "undefined" || !("Notification" in window)) return null;
//   if (!(await isSupported())) return null;
//   if (Notification.permission !== "granted") return null;

//   const messaging = getMessaging(getFirebaseApp());
//   return onMessage(messaging, onPush);
// }

export async function subscribeToForegroundMessages(
  onPush: (payload: MessagePayload) => void,
) {
  console.log("Subscribing...");

  if (!(await isSupported())) {
    console.log("Messaging not supported");
    return null;
  }

  console.log("Permission:", Notification.permission);

  const messaging = getMessaging(getFirebaseApp());

  return onMessage(messaging, (payload) => {
    console.log("Received payload:", payload);
    onPush(payload);
  });
}
