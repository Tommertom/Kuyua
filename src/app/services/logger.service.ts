import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { FirebaseService } from './firebase.service';


import { Clipboard } from '@capacitor/clipboard';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  logCount = 0;
  log = [];
  logDoc = 'none';

  constructor(
    private firebase: FirebaseService,
    private platform: Platform,
  ) { }

  wantLogging(): boolean {
    return false;
    // return true;
    return environment.production
      && (window.location.hostname !== 'localhost')
      && (!window.location.hostname.includes('preview'));
  }

  startLogging() {
    if (this.wantLogging()) {
      console.log('Remote logging started');

      const now = new Date();
      const dateLabel = now.toLocaleDateString().replace(/\//g, '.');
      const timeLabel = now.toLocaleTimeString().replace(/\:/g, '.').replace(/\ /g, '.');
      this.logDoc = dateLabel + '.' + timeLabel;

      if (window) {
        window.console.warn = () => {

        };

        window.console.error =
          window.console.log = (...args) => {
            if (this.logCount > 1000) {
              this.logCount = 0;
              this.log = [];
            }
            this.log.push({ [this.logCount]: args });
            this.logCount += 1;

            try {
              Clipboard.write({
                string: JSON.stringify(this.log, null, 2)
              });
            } catch (e) {

            }



            // const element = document.getElementById("log");
            //  if (element) {
            //   document.getElementById('log').innerHTML = JSON.stringify(this.log, null, 2);
            //  }


            /*
            if (this.platform.is('ios')) {
              this.firebase.getAuthObject().currentUser.then(user => {
                if (user === null) { return false; }
                const path = `/users/${user.uid}/_lastlog/`;
                this.firebase.doc(path + this.logDoc).set({ log: JSON.stringify(this.log, null, 2) });
              });
            }
            */
          };
      }
    }
  }

  saveRemote(batch: any, path: string) {
    if (this.wantLogging()) {
      //      batch.set(this.firebase.doc(path + this.logDoc).ref, { log: JSON.stringify(this.log, null, 2) });
    }
  }
}


