importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSyBcQ8zCGs2UHAHFwu_EjlskzcW5PGZrgIM',
    authDomain: 'kuyua-2199c.firebaseapp.com',
    databaseURL: 'https://kuyua-2199c.firebaseio.com',
    projectId: 'kuyua-2199c',
    storageBucket: 'kuyua-2199c.appspot.com',
    messagingSenderId: '322936786860',
    appId: '1:322936786860:web:0a161ea71869ca824cf409',
    measurementId: 'G-1QEFZLZLFJ'
});

const isSupported = firebase.messaging.isSupported();
if (isSupported) {
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage(({ notification: { title, body, image } }) => {
        self.registration.showNotification(title, { body, icon: image || '/assets/icons/favicon.png' });
    });
}