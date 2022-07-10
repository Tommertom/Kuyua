import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate, SwPush } from '@angular/service-worker';

import { BehaviorSubject, concat, interval, Observable } from 'rxjs';

import { first } from 'rxjs/operators';
import { Platform } from '@ionic/angular';

import { FirebaseApp } from '@angular/fire';
import 'firebase/messaging';

import { AngularFireAnalytics } from '@angular/fire/analytics';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { untilDestroyed } from '@ngneat/until-destroy';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PwaService {

  private deferredPrompt: any;

  private messageToken$ = new BehaviorSubject<{ [id: string]: string }>({});

  private pushNotifications$ = new BehaviorSubject<Notification[]>([]);
  private notificationState$ = new BehaviorSubject<string>(undefined);
  private clickNotifications$ = new BehaviorSubject<
    {
      action: string;
      notification: NotificationOptions & {
        title: string;
      };
    }>(undefined);

  private pwaUpdateAvailable$ = new BehaviorSubject<boolean>(false);
  private a2hsAvailable$ = new BehaviorSubject<boolean>(false);

  pushNotificationsEnabled = false;

  constructor(
    private platform: Platform,
    private swPush: SwPush,
    private GA: AngularFireAnalytics,
    private firebaseApp: FirebaseApp,
    //    private afMessaging: AngularFireMessaging,
    private appRef: ApplicationRef,
    private updates: SwUpdate,
  ) {

    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('BeforeInstallPrompt  PWA', e);
      e.preventDefault();
      this.setdeferredPrompt(e);
    });

    if ('serviceWorker' in navigator && environment.production) { // && !this.platform.is('ios')
      window.addEventListener('load', () => {
        console.log('🚀 ~ serviceWorker ~ waiting to stabilise');
        appRef.isStable
          .pipe(untilDestroyed(this),
            first(isStable => isStable === true))
          .subscribe(async ref => {
            //   const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            //   console.log('🚀 ~ serviceWorker ~ registered', swRegistration);

            // PWA - check for updates
            const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
            const everySixHours$ = interval(6 * 60 * 60 * 1000);
            const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$).pipe(untilDestroyed(this));
            everySixHoursOnceAppIsStable$.subscribe(() => this.updates.checkForUpdate());

            this.updates.available.pipe(untilDestroyed(this))
              .subscribe(event => {
                this.pwaUpdateAvailable$.next(true);
                console.log('Update available', event);
              });

            // notification listeners setup

            //   this.setupNotificationListeners();

            // just once a check
            setTimeout(() => {
              this.checkAppUpdate();
              //   navigator.serviceWorker.getRegistration().then(reg => { console.log('asdsadasd', reg); });
            }, 10 * 1000);
          });
      });
    }
  }

  checkAppUpdate() {
    if ('serviceWorker' in navigator && environment.production) {
      this.updates.checkForUpdate();
    }
  }

  // Android only works
  setdeferredPrompt(dp: any) {
    this.deferredPrompt = dp;
    this.GA.logEvent('pwa_install', {
      eventCategory: 'pwa_install2',
      eventAction: 'deferred_prompt_available',
      nonInteraction: true
    });
    this.a2hsAvailable$.next(true);
  }

  async showAddToHomeScreen() {
    this.GA.logEvent('pwa_install', {
      eventCategory: 'pwa_add_to_homescreen',
      eventAction: this.platform.is('ios') ? 'install_iOS' : 'install_android',
      nonInteraction: false
    });

    if (this.platform.is('ios')) {
      return; // we have nothing for ios
    } else {
      return this.showAddToHomeScreenAndroid();
    }
  }

  async showAddToHomeScreenAndroid() {
    if (this.deferredPrompt) {
      await this.deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      return this.deferredPrompt.userChoice
        .then((choiceResult: { outcome: string; }) => {
          // this.deferredPrompt = null;

          this.GA.logEvent('pwa_install', {
            eventCategory: 'pwa-add-to-homescreen',
            eventAction: choiceResult.outcome === 'accepted' ? 'user accepted A2HS' : 'user did not accept A2HS',
            nonInteraction: false
          });

          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
            this.a2hsAvailable$.next(false);
            return true;
          } else {
            console.log('User dismissed the A2HS prompt');
            this.a2hsAvailable$.next(false);
            return false;
          }
        });
    } else {
      console.log('No deferred prompt available');
      return false;
    }
  }

  getA2HSAvailable$() {
    return this.a2hsAvailable$ as Observable<boolean>;
  }

  async updateApp() {
    this.GA.logEvent('pwa_update', {
      eventCategory: 'pwa_update',
      eventAction: 'update_requested',
      nonInteraction: true
    });
    return this.updates.activateUpdate()
      .then(() => {
        document.location.reload();
        return true; // never fired
      })
      .catch(err => {
        return err;
      });
  }

  getUpdateAvailabe$() {
    return this.pwaUpdateAvailable$ as Observable<boolean>;
  }

  async initNotifications() {
    /*
    var isMacLike = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    var isIOS = /(iPhone|iPod|iPad)/i.test(navigator.platform);
    */
    // if (!this.platform.is('ios') && !navigator.platform.includes('Mac')) {

    if (this.platform.is('ios') || navigator.platform.includes('Mac')) {
      return false;
    }

    /*

    {
      "message":{
        "notification":{
          "title":"Portugal vs. Denmark",
          "body":"great match!"
        }
      }
    }

    {
      "notification": {
        "title": "Angular News",
          "body": "Newsletter Available!",
            "icon": "assets/main-page-logo-small-hat.png",
              "vibrate": [100, 50, 100],
                "data": {
          "dateOfArrival": Date.now(),
            "primaryKey": 1
        },
        "actions": [{
          "action": "explore",
          "title": "Go to the site"
        }]
      }

    * /

      //  && copy src\\firebase-messaging-sw.js www
      const VAPID_PUBLIC_KEY = 'BEYQVzBmAoN4L8Q7oJhBLtyd4sVtayDC-2WZ5wn34arngiy_0RX0mpSy9sHSinAHyhBT534cwwrkr49A1qqNg-M';
      /*
          this.swPush.requestSubscription({
            serverPublicKey: VAPID_PUBLIC_KEY
          })
            .then(sub => console.log('asdsadasdas', sub))
            .catch(err => console.error('Could not subscribe to notifications', err));

      */

    const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration();
    const messaging = this.firebaseApp.messaging();

    console.log('initNotifications serviceWorkerRegistration', serviceWorkerRegistration);

    // we don't want to move without service worker
    if (serviceWorkerRegistration === undefined) {
      return false;
    }

    return messaging.getToken({
      vapidKey:
        'BEYQVzBmAoN4L8Q7oJhBLtyd4sVtayDC-2WZ5wn34arngiy_0RX0mpSy9sHSinAHyhBT534cwwrkr49A1qqNg-M',
      serviceWorkerRegistration  // this should be the fix for angularfire not working with ngsw
    })
      .then((currentToken) => {
        console.log('getToken currentToken', currentToken);
        let instanceID = window.localStorage.getItem('_notificationInstanceID');
        if (instanceID === null) {
          instanceID = '_ID' + Math.random() * Date.now();
          window.localStorage.setItem('_notificationInstanceID', instanceID);
        }
        this.messageToken$.next({ [instanceID]: currentToken });
        this.setupNotificationListeners();
        this.pushNotificationsEnabled = true;
      })
      .catch((err) => {
        this.pushNotificationsEnabled = false;
        console.log('An error occurred while retrieving token. ', err);

        return false;
      });
  }


  setupNotificationListeners() {
    if (this.platform.is('ios') || navigator.platform.includes('Mac')) {
      return;
    }

    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'push', userVisibleOnly: true })
        .then((permissionStatus) => {

          this.pushNotificationsEnabled = (permissionStatus.state === 'granted');
          this.notificationState$.next(permissionStatus.state);

          console.log('push permission state is ', permissionStatus.state, this.pushNotificationsEnabled);

          permissionStatus.onchange = (state) => {
            console.log('status change of notifications', state);

            const permissionState = (state.currentTarget as PermissionStatus).state;

            this.pushNotificationsEnabled = (permissionState === 'granted');
            this.notificationState$.next(permissionState);

          };
        });

      navigator.permissions.query({ name: 'notifications' })
        .then((permissionStatus) => {
          console.log('notifications permission state is ', permissionStatus.state);
        });
    }

    const messaging = this.firebaseApp.messaging();
    messaging.onMessage(m => {
      console.log('On MESSAGE', m);
    });

    this.swPush.messages.pipe(untilDestroyed(this))
      .subscribe((notification: Notification) => {
        this.pushNotifications$.next([...this.pushNotifications$.getValue(), notification]);
        console.log('push message', notification);
      });

    this.swPush.notificationClicks
      .subscribe(click => {
        this.clickNotifications$.next(click);
        console.log('notification click', click);
      });
    /*
  this.swPush.notificationClicks
      .subscribe(click => {
        this.clickNotifications$.next(click);
        console.log('notification click', click);
      });


  this.afMessaging.messages
    .subscribe((message) => { console.log('asdsadsad', message); });


    this.swPush.messages.pipe(untilDestroyed(this))
      .subscribe((notification: Notification) => {
        this.pushNotifications$.next([...this.pushNotifications$.getValue(), notification]);
        // console.log('push message', msg);
      });
  */


    /*
  this.afMessaging.tokenChanges.pipe(untilDestroyed(this))
    .subscribe(token => {
      let instanceID = window.localStorage.getItem('_notificationInstanceID');
      if (instanceID === null) {
        instanceID = '_ID' + Math.random() * Date.now();
        window.localStorage.setItem('_notificationInstanceID', instanceID);
      }
      if (token) {
        console.log('TOKEN RECEIVED', token);
        this.messageToken$.next({ [instanceID]: token });
      }
    });
    */
  }

  getNotificationState$() {
    return this.notificationState$.asObservable();
  }


  getPushNotifications$() {
    return this.pushNotifications$.asObservable();
  }

  getMessagingToken$(): Observable<{ [id: string]: string }> {
    return this.messageToken$.asObservable();
  }

  instanceHasNotifications(): boolean {
    const instanceID = window.localStorage.getItem('_notificationInstanceID');
    return this.messageToken$.value[instanceID] !== undefined;
  }

  clearNotifications() {
    this.pushNotifications$.next([]);
  }

  getPushNotificationsEnabled() {
    console.log('Get push notifications enabled', this.pushNotificationsEnabled);
    return this.pushNotificationsEnabled;
  }

}

    // { "notification": {"body": "Kabbage Demo", "icon": "https://www.kabbage.com/favicon.ico", "title": "Demo"}}
/*
actions: []
badge: ""
body: "Kabbage Demo"
data: null
dir: "auto"
icon: "https://www.kabbage.com/favicon.ico"
image: ""
lang: ""
renotify: false
requireInteraction: false
silent: false
tag: ""
timestamp: 1609704485854
title: "Demo"
vibrate: []
*/

