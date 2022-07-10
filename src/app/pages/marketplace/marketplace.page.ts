import { Component, OnInit } from '@angular/core';
import { IonItemSliding, LoadingController, ModalController, Platform } from '@ionic/angular';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, filter, switchMap, debounceTime, first, timeout, take } from 'rxjs/operators';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { User } from 'src/app/interfaces/user';
import { Production } from 'src/app/interfaces/Production';

import { ContactbuyersPage } from 'src/app/modals/contactbuyers/contactbuyers.page';
import { ContactsellersPage } from 'src/app/modals/contactsellers/contactsellers.page';

import { PwaService } from 'src/app/services/pwa.service';
import { UserService } from 'src/app/services/data/user.service';

import { BuyingOpportunityService } from 'src/app/services/data/buyingopportunity.service';

import { BuyingOpportunity } from 'src/app/interfaces/BuyingOpportunity';
import { environment } from 'src/environments/environment';
import { InAppMessagesService } from 'src/app/services/in-app-messages.service';
import { AppMessage, MessageTypes } from 'src/app/interfaces/message';
import { AccountdetailsPage } from 'src/app/modals/accountdetails/accountdetails.page';

import { combineLatest } from 'rxjs';
import { GoogleAnalytics } from 'src/app/decorators/ga';

type SortKey = {
  fieldName: string;
  order: number;
};

type FilterKey = {
  fieldName: string;
  filterString: string;
};

@UntilDestroy()
@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.page.html',
  styleUrls: ['./marketplace.page.scss'],
})
export class MarketplacePage implements OnInit {

  user: User;

  skeletonItems = [0, 1];
  messageTypes = MessageTypes;

  buyingOpportunitiesOfInterest$: Observable<BuyingOpportunity[]>;
  buyingOpportunitiesPublished$: Observable<BuyingOpportunity[]>;
  appMessages$: Observable<AppMessage[]>;

  sortKey$ = new BehaviorSubject<SortKey>({
    fieldName: 'creationDate',
    order: -1
  });
  filterKey$ = new BehaviorSubject<FilterKey[]>([{
    fieldName: 'creationDate',
    filterString: ''
  }]);

  showExperimental = false;

  constructor(
    private modalController: ModalController,
    private userService: UserService,
    private buyingopportunityService: BuyingOpportunityService,
    private pwaService: PwaService,
    private inAppMessageService: InAppMessagesService,
    private platform: Platform,
    private loadingCtrl: LoadingController,
  ) {
    this.user = this.userService.validate({});

    this.appMessages$ = this.inAppMessageService.getMessages$()
      .pipe(map(messages => {
        return messages
          .sort((one: AppMessage, two: AppMessage) => (one.messageType > two.messageType ? -1 : 1));
      }));

    this.buyingOpportunitiesPublished$ =
      combineLatest([this.sortKey$, this.filterKey$])
        .pipe(
          switchMap(([sortKey, filterKey]) =>
            this.buyingopportunityService
              .getPublishedOpportunities$()
              .pipe(
                map((opportunities: BuyingOpportunity[]) => {
                  return opportunities
                    .filter(opportunity => opportunity.sellerUserID !== this.user.userID)
                    .sort((one: BuyingOpportunity, two: BuyingOpportunity) =>
                      (one[sortKey.fieldName] > two[sortKey.fieldName] ? sortKey.order : sortKey.order * -1));
                }))
          ));

    this.buyingOpportunitiesOfInterest$ =
      this.buyingopportunityService
        .getBuyingOpportunities$()
        .pipe(
          map(opportunitiesOfInterest => {
            return opportunitiesOfInterest
              //  .filter(opportunity => opportunity.userIsInterested)
              .sort((one: BuyingOpportunity, two: BuyingOpportunity) => (one.lastContact > two.lastContact ? -1 : 1));
          }));
  }

  async ngOnInit() {
    this.userService.getUser$()
      .pipe(untilDestroyed(this), filter(user => user !== undefined))
      .subscribe(user => {
        this.user = user;
      });
  }

  @GoogleAnalytics('marketplace')
  ionViewDidEnter() {

    this.inAppMessageService.getFirstMessageOfType$(MessageTypes.ViewPublishedOpportunity)
      .subscribe(async message => {
        this.buyingopportunityService.getPublishedOpportunities$()
          .pipe(
            filter(opportunities => opportunities.length > 0),
            take(1),
            //  first(),
            map(opportunities => opportunities
              .filter(opportunity => opportunity.buyingOpportunityID === message.payload)[0])
          )
          .subscribe(async oppo => {

            console.log('OPPPPO', oppo);
            this.inAppMessageService.removeMessagesOfType(MessageTypes.ViewPublishedOpportunity);

            if (oppo === undefined) {
              this.inAppMessageService.presentToast('Opportunity not found');
            }

            if (oppo !== undefined) {
              await this.contactSeller(oppo);
            }
          });

      });
  }

  opportunitySegmentChanged(event) {
    this.sortKey$.next({
      fieldName: 'creationDate',
      order: event.detail.value === 'ascending' ? 1 : -1
    });
  }

  @GoogleAnalytics('marketplace')
  async enablePushNotifications() {
    const result = await this.pwaService.initNotifications();
    console.log('Enable push notifications', result);
    // todo - too many writes here - check on change
    this.userService.setUserProperty({ prop: 'pushNotificationsEnabled', value: result });
    if (result) {
      this.inAppMessageService.removeMessagesOfType(MessageTypes.AcceptNotifcations);
    }
  }

  @GoogleAnalytics('marketplace')
  async installPrompt() {
    console.log('Add app');
    if (this.platform.is('ios')) {
      // https://www.netguru.com/codestories/pwa-ios
      this.inAppMessageService.presentAlert('Add to home screen - please do so manually');
      this.inAppMessageService.removeMessagesOfType(MessageTypes.InstallApp);
    } else {
      const res = await this.pwaService.showAddToHomeScreen();
      this.userService.setUserProperty({ prop: 'appInstalled', value: res });
      if (res) {
        this.inAppMessageService.removeMessagesOfType(MessageTypes.InstallApp);
      }
    }
  }

  @GoogleAnalytics('marketplace')
  async updateNewVersion() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 10000
    });
    await loading.present();

    //  await this.firebaseService.signOut(); // to persist login after update - maybe nice feature??

    const res = await this.pwaService.updateApp();
    setTimeout(() => {
      if (res !== true) {
        this.inAppMessageService.presentAlert('Update of app failed ' + res);
        console.error('Error updating', res);
      }
    }, 500);
  }

  @GoogleAnalytics('marketplace')
  async openAccountDetails() {
    const modal = await this.modalController.create({
      component: AccountdetailsPage,
      componentProps: { user: this.user }
    });
    return await modal.present();
  }

  archiveBuyingOpportunities(oppportunity: BuyingOpportunity, slider: IonItemSliding) {
    if (slider) {
      slider.close();
    }
    this.buyingopportunityService.tagNotInterested(oppportunity);
  }

  async contactBuyer(production: Production) {
    const modal = await this.modalController.create({
      component: ContactbuyersPage,
      cssClass: 'fullscreen-modal',
      //  event: ev,
      componentProps: { production },
      // translucent: true
    });
    return await modal.present();
  }

  async contactSeller(opportunity: BuyingOpportunity) {
    if (opportunity.sellerUserID === this.user.userID) {
      console.log('Contacting yourself');
      if (environment.production) {
        return;
      }
    }
    const modal = await this.modalController.create({
      component: ContactsellersPage,
      cssClass: 'fullscreen-modal',
      //  event: ev,
      componentProps: { opportunity },
      //     translucent: true
    });
    return await modal.present();
  }
}
