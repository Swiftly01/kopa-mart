

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

const firebaseConfig = {
  apiKey: "AIzaSyDrhQV6jIEIXOdvJe6G2KI-5Iau6kM1sfI",
  authDomain: "kopamart-f6037.firebaseapp.com",
  projectId: "kopamart-f6037",
  storageBucket: "kopamart-f6037.firebasestorage.app",
  messagingSenderId: "644397186180",
  appId: "1:644397186180:web:b55bb8afff15f4b6d156d1",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();


messaging.onBackgroundMessage((payload) => {
  console.log("Background payload:", payload);

  const data = payload.data ?? {};

  self.registration.showNotification(data.title ?? "KopaMart", {
    body: data.body,
    icon: data.icon || "/icons/icon-192.png",
    badge: data.badge || "/icons/badge-72.png",
    image: data.image,
    data,
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "https://kopamart.com";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});