import { Component, OnInit, Input } from '@angular/core';

import { Observable } from 'rxjs';
import { first, map, take } from 'rxjs/operators';

import { IonItemSliding, AlertController, Platform } from '@ionic/angular';

import { Production } from 'src/app/interfaces/Production';

import { UserService } from 'src/app/services/data/user.service';
import { User } from 'src/app/interfaces/user';
import { BuyingInterest } from 'src/app/interfaces/buyinginterest';
import { BuyinginterestService } from 'src/app/services/data/buyinginterest.service';
import { ViewproductionPage } from '../viewproduction/viewproduction.page';
import { SideModalService } from 'src/app/services/side-modal.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { GoogleAnalytics } from 'src/app/decorators/ga';


@UntilDestroy()
@Component({
  selector: 'app-contactbuyers',
  templateUrl: './contactbuyers.page.html',
  styleUrls: ['./contactbuyers.page.scss'],
})
export class ContactbuyersPage implements OnInit {

  @Input() production: Production;
  @Input() buyerToFlagID = '';

  interestedBuyers$: Observable<BuyingInterest[]>;

  showListContacts = true;
  showConversationReview = false;

  user: User;

  constructor(
    private buyinginterestService: BuyinginterestService,
    private userService: UserService,
    private sideModalCtrl: SideModalService,
    private alertController: AlertController,
    private platform: Platform
  ) { }

  @GoogleAnalytics('contactbuyer')
  ionViewDidEnter() {

  }

  ngOnInit() {
    this.interestedBuyers$ = this.buyinginterestService.getBuyinginterests$()
      .pipe(map(list => {
        return list.filter(item => {
          return (item.productionID === this.production.productionID) && !item.archived;
        });
      }));

    this.userService.getUser$()
      .pipe(untilDestroyed(this))
      .subscribe(user => { this.user = user; });
  }

  closeModal() {
    this.sideModalCtrl.dismiss();
  }

  @GoogleAnalytics('contactbuyer')
  async contactBuyer(interestedBuyer: BuyingInterest) {


    // TODO:   this.buyingopportunityService.contactedSeller(this.opportunity);

    const alert = await this.alertController.create({
      //    cssClass: 'my-custom-class',
      header: 'WhatsApp contact',
      message: `Do you want to contact ${interestedBuyer.buyerDisplayName} via WhatsApp?`,
      /*
      inputs: [
        {
          name: 'line',
          type: 'text',
          placeholder: 'Type your message here'
        },
      ],
      */
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            //   this.sideModalCtrl.dismiss();
          }
        },
        {
          text: 'Okay',

          handler: (data: { line: string }) => {
            //     this.GA.logEvent('kuyua_contactbuyers', {
            //      eventCategory: 'open_whatsapp'
            //    });

            console.log('ContactbuyersPage contactBuyer', interestedBuyer);
            // we smoothen the transition so the user does not see this before whatsapp starts
            setTimeout(() => {
              //  this.showListContacts = false;
              //  this.showConversationReview = true;
            }, 1000);
            this.sideModalCtrl.dismiss();
            console.log('sdfsdfs', data);

            //    if (data.line.length === 0) {
            const line = `Hi ${interestedBuyer.buyerDisplayName}, I like to talk to you about your interest in ${interestedBuyer.productionCommodity} on Kuyua.`;
            //   }

            //
            // const whapURL = `whatsapp://send?phone=${interestedBuyer.buyerWhatsAppNr}&text=${data.line}`;
            // const whapURL = `https://wa.me/${interestedBuyer.buyerWhatsAppNr}?text=${data.line}`;
            //       whapURL = `https://wa.me/${interestedBuyer.buyerWhatsAppNr}?text=${data.line}&text&app_absent=0`;

            let whapURL = `whatsapp://send?phone=${interestedBuyer.buyerWhatsAppNr}&text=${line}`;
            if (this.platform.is('desktop')) {
              whapURL = `https://web.whatsapp.com/send?phone=${interestedBuyer.buyerWhatsAppNr}?text=${line}&app_absent=0`;
            }
            this.openWhatsApp(whapURL);
          }
        }
      ]
    });
    await alert.present();
  }

  @GoogleAnalytics('contactbuyer')
  openWhatsApp(whapURL: string) {
    //     whapURL = `https://web.whatsapp.com/send?phone=${this.opportunity.sellerUserWhatsAppNr}?text=${data.line}&app_absent=0`;

    //    https://web.whatsapp.com/send?phone=%2B31622414799&text&app_absent=0
    window.open(whapURL); // 'https://wa.me/31622414799?text=Hi!');
  }

  @GoogleAnalytics('contactbuyer')
  removeInterestBuyer(interestedBuyer: BuyingInterest, slider: IonItemSliding) {
    if (slider) {
      slider.close();
    }
    this.buyinginterestService.removeInterestBuyer(interestedBuyer);
  }

  @GoogleAnalytics('contactbuyer')
  async showProduction(production: Production) {

    console.log('Wanting to see production', production);
    //  if (!production.isSold) {
    const modal = await this.sideModalCtrl.create({
      component: ViewproductionPage,
      componentProps: { production }
    });
    await modal.present();
    // }
  }


  /*
    User options: comment conversation & mark production as sold
  */
  submitConversationReview() {
    /*
    const newReview: ConversationReview = this.converstationReviewService.validate({
      comments: 'Comment ' + Date.now(),
      productionID: this.production.productionID,
      otherUserID: this.interestedBuyer.interestUserID,
    });
    this.converstationReviewService.upsert(newReview);

    this.converstationReviewService.getConversationReviews$().pipe(take(1)).subscribe(console.log);
  */
    this.closeModal();
  }


  submitConversationReviewAndSold() {
    /*

    this.submitConversationReview();

       const newPurchase: Purchase = this.purchaseService.validate({
         productionID: this.production.productionID,
         //   buyerUserID: this.interestedBuyer.interestUserID,
         buyingDate: Date.now()
       });
       this.purchaseService.upsertPurchase(newPurchase);

       // debugging
       this.purchaseService.getPurchases$().pipe(take(1)).subscribe(console.log);
   */

    this.closeModal();
  }

}
