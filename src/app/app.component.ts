
import { ApplicationRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Platform } from '@ionic/angular';



import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { InAppMessagesService } from './services/in-app-messages.service';
import { LoggerService } from './services/logger.service';
import { PwaService } from './services/pwa.service';
import { environment } from 'src/environments/environment';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  googleAPILoaded = true;

  constructor(
    private appRef: ApplicationRef,
    private updates: SwUpdate,
    //  private storage: Storage,
    private platform: Platform,
    private inAppMessage: InAppMessagesService,
    private pwaService: PwaService,
    private loggerService: LoggerService,
  ) {

    this.loggerService.startLogging();
    this.pwaService.checkAppUpdate(); // every new login - we do a server check on update

    console.log('Platforms', this.platform.platforms());

    this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('Handler was called!');
    });
  }

  async ngOnInit() {

    // to support testing via emulator
    if (window.location.hostname === 'localhost') {

      if (environment.production) {
        alert('HEY!!! WORKING ON PRODUCTION');
      }
      /*
      const db = firebase.firestore();
      console.log('localhost detected! changing to firestore emulator');
      db.settings({
        host: 'localhost:8080',
        ssl: false
      });

      const auth = firebase.auth();
      auth.useEmulator('http://localhost:9099');
    */
    }
  }
}
