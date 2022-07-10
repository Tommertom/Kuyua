import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();

  if (window) {
    //   window.console.log = window.console.warn = window.console.debug = window.console.info = () => { };
    // Don't log anything.
  }
}

// https://forum.ionicframework.com/t/indexeddb-in-latest-ios/210306/16
// const db = window.indexedDB;
// console.log('DB', db);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
