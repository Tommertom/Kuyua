import { NgModule, Injectable, ErrorHandler, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
// import { AngularFirePerformanceModule, PerformanceMonitoringService } from '@angular/fire/performance';

import { AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { environment } from '../environments/environment';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';

import { ServiceWorkerModule } from '@angular/service-worker';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { LoggerService } from './services/logger.service';

// import { USE_EMULATOR as USE_FIRESTORE_EMULATOR } from '@angular/fire/firestore';
// import { USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/functions';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule,
    BrowserAnimationsModule,

    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAnalyticsModule,

    AngularFirestoreModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireMessagingModule,
    AngularFireStorageModule,
    //  AngularFirePerformanceModule,

    HttpClientModule,

    IonicModule.forRoot(),

    AppRoutingModule,

    // copy www\\ngsw-worker.js www\\firebase-messaging-sw.js && del www\\ngsw-worker.js

    ServiceWorkerModule.register('sw-loader.js', { enabled: environment.production }),
  ],
  providers: [
    LoggerService,
    FormBuilder,
    ScreenTrackingService,
    UserTrackingService,

    //  PerformanceMonitoringService,
    //    { provide: ErrorHandler, useClass: MyErrorHandler },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    // { provide: USE_FIRESTORE_EMULATOR, useValue: environment.useEmulators ? ['localhost', 8080] : undefined },
    //  { provide: USE_FUNCTIONS_EMULATOR, useValue: environment.useEmulators ? ['localhost', 5001] : undefined },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }


/*

  "auth": {
            "port": 9099
        },
        "functions": {
            "port": 5001
        },
        "firestore": {
            "port": 8080
        },
        "hosting": {
            "port": 5000
        },
        "ui": {
            "enabled": true,
            "port": 4000
        },
        "storage": {
            "port": 9199
        }


*/
