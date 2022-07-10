import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, map, tap } from 'rxjs/operators';
import { MessageTypes } from 'src/app/interfaces/message';
import { User } from 'src/app/interfaces/user';
import { WelcomewizardPage } from 'src/app/modals/welcomewizard/welcomewizard.page';
import { BuyingOpportunityService } from 'src/app/services/data/buyingopportunity.service';

import { ProductionService } from 'src/app/services/data/production.service';
import { UserService } from 'src/app/services/data/user.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { InAppMessagesService } from 'src/app/services/in-app-messages.service';
import { PwaService } from 'src/app/services/pwa.service';


@UntilDestroy()
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  tabMarketplaceBadgeCount = 0;
  notificationCount = 0;

  user: User;

  constructor(
    private buyingOpportunityService: BuyingOpportunityService,
    private userService: UserService,
    private pwaService: PwaService,
    private modalCtrl: ModalController,
    private inAppMessageService: InAppMessagesService,
    private router: Router,
    private platform: Platform,
    private firebaseService: FirebaseService,
  ) {


  }

  async ngOnInit() {

    // let's handle some user settings in the app, now we know we are logged in
    this.userService.getUser$()
      .pipe(untilDestroyed(this), filter(user => user !== undefined))
      .subscribe(user => {
        if (!user.mobileVerified) {
          this.inAppMessageService.publishMessage({ messageType: MessageTypes.VerifyMobile });
        } else {
          this.inAppMessageService.removeMessagesOfType(MessageTypes.VerifyMobile);
        }
      });

    // set some status flags needed to continue the onboarding flow or other stuff happening
    this.pwaService.checkAppUpdate(); // every new login - we do a server check on update
    console.log('Init notifications', navigator.userAgent, navigator.platform);

    // setup push notifications for Android only
    if (!this.platform.is('ios') && !navigator.platform.includes('Mac')) {
      this.pwaService.initNotifications();

      this.pwaService.getNotificationState$()
        .pipe(
          untilDestroyed(this),
          filter(state => state !== undefined)
        )
        .subscribe(state => {

          console.log('Notification state', state);
          this.inAppMessageService.removeMessagesOfType(MessageTypes.AcceptNotifcations);
          this.inAppMessageService.removeMessagesOfType(MessageTypes.DeniedNotifcations);

          if (state === 'prompt') {
            this.inAppMessageService.publishMessage({ messageType: MessageTypes.AcceptNotifcations });
          }

          if (state === 'denied') {
            this.inAppMessageService.publishMessage({ messageType: MessageTypes.DeniedNotifcations });
          }
        });
    }

    // trigger add to home screen if not installed - a bit raw implementation
    this.pwaService.getA2HSAvailable$()
      .pipe(untilDestroyed(this),
        filter(available => available))
      .subscribe(async a2hsavailable => {
        console.log('A@H available', a2hsavailable);
        this.inAppMessageService.removeMessagesOfType(MessageTypes.InstallApp);
        if (a2hsavailable) {
          this.inAppMessageService.publishMessage({ messageType: MessageTypes.InstallApp });
        }
      });

    this.pwaService.getUpdateAvailabe$()
      .pipe(untilDestroyed(this), filter(updateAvailable => updateAvailable))
      .subscribe(updateAvailable => {
        this.inAppMessageService.publishMessage({
          messageType: MessageTypes.NewAppVersion,
        });
      });

    this.pwaService.getMessagingToken$()
      .pipe(untilDestroyed(this), filter(token => Object.keys(token).length > 0))
      .subscribe(async token => {
        console.log('tabs getMessagingToken', token);
        this.userService.upsertNotificationToken(token);
      });


    this.pwaService.getPushNotifications$()
      .pipe(untilDestroyed(this))
      .subscribe(notifications => {
        //   this.notificationCount = notifications.length;
        console.log('Tabs notifications', notifications);
      });

    this.userService.getUser$()
      .pipe(untilDestroyed(this), filter(user => user !== undefined))
      .subscribe(user => {
        this.user = user;
      });

    this.buyingOpportunityService.getPublishedOpportunities$()
      .pipe(untilDestroyed(this),

        map(opportunities =>
          opportunities.filter(opportunity => opportunity.creationDate > this.user.lastLogout && opportunity.lastViewed === 0)),

        map(newOpportunities => newOpportunities.length),

        filter(count => count !== this.tabMarketplaceBadgeCount)
      )
      .subscribe(count => {
        console.log('Updating count', this.tabMarketplaceBadgeCount, count);
        this.tabMarketplaceBadgeCount = count;
      });
  }

  async ionViewDidEnter() {
    const tempUser = this.userService.getTempUser();
    if (tempUser !== null) {
      const user = tempUser;

      console.log('User welcome triggers:', user);

      if (user !== null && !user.hasCompletedWelcome) {

        const modal = await this.modalCtrl.create({
          cssClass: 'fullscreen-modal',
          component: WelcomewizardPage,
          componentProps: { user: this.userService.getTempUser() },
          backdropDismiss: false,
        });

        let goToMarketPlace = false;
        this.inAppMessageService.getFirstMessageOfType$(MessageTypes.ViewPublishedOpportunity)
          .subscribe(_ => {
            goToMarketPlace = true;
            this.inAppMessageService.presentToast('Please complete registration before continuing');
          });

        // bit of overkill - can do const {data}= await modal.onDidDismiss() too
        modal.onDidDismiss()
          .then((returnValue) => {
            const { data } = returnValue;
            this.userService.setTempUser(null);

            if (goToMarketPlace) {
              this.router.navigateByUrl('/tabs/marketplace');
            }
          });
        await modal.present();
      }
    }
  }
}
