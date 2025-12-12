importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSy...",
  authDomain: "assignmate-cfe7e.firebaseapp.com",
  projectId: "assignmate-cfe7e",
  storageBucket: "assignmate-cfe7e.firebasestorage.app",
  messagingSenderId: "1076968866164",
  appId: "1:1076968866164:web:..."
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
