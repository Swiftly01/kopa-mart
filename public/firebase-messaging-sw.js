importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

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

  self.registration.showNotification(
    payload.notification?.title ?? "KopaMart",
    {
      body: payload.notification?.body,
      icon: "/icons/icon-192.png",
      data: payload.data,
    },
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "https://kopamart.com";

  event.waitUntil(
    (async () => {
      const windowClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin)) {
          await client.navigate(url);
          return client.focus();
        }
      }

      return clients.openWindow(url);
    })(),
  );
});

// self.addEventListener('push', function(event) {
//     console.log('Received a push message', event.data.json());

//     // convert string to JSON
//     const data = event.data.json();
//     const title = data.title;
    
//     const options = {
//         body: data.body,
//         icon: data.icon,
//         data : {
//             url : data.url
//         },
//     };
//     event.waitUntil(self.registration.showNotification(title, options));
// });

// self.addEventListener('notificationclick', function(event) {
//     clients.openWindow(event.notification.data.url);
// }, false);
