// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  useEmulators: false,
  firebaseConfig: {
    apiKey: 'xxxxx',
    authDomain: 'xxxxxx.firebaseapp.com',
    databaseURL: 'https://xxxxxx.firebaseio.com',
    projectId: 'xxxxxx',
    storageBucket: 'xxxxxx.appspot.com',
    messagingSenderId: '322936786860',
    appId: '1:322936786860:web:0a161ea71869ca824cf409',
    measurementId: 'G-SCSKN71MGZ'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
