importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCkILlkf-LHXyTOnIuwQgnisczB3fT9GYA",
  authDomain: "planning-with-ai-be6ab.firebaseapp.com",
  projectId: "planning-with-ai-be6ab",
  storageBucket: "planning-with-ai-be6ab.firebasestorage.app",
  messagingSenderId: "202841406595",
  appId: "1:202841406595:web:ed3abcf976f969a0052fb6"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://i.ibb.co/0pVsZCnx/assignmate.png',
    badge: 'https://i.ibb.co/0pVsZCnx/assignmate.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});