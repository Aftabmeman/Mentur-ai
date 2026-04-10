importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDLhwHrCrYI1RmthpMyAfyecX80EPwI9Uo",
  authDomain: "studio-8515730718-27b1e.firebaseapp.com",
  projectId: "studio-8515730718-27b1e",
  messagingSenderId: "417674426575",
  appId: "1:417674426575:web:9c1cda1c088fd719679fba"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});