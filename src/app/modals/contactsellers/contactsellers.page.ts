import { Component, OnInit, Input } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


import { AlertController, Platform } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BuyingOpportunity } from 'src/app/interfaces/BuyingOpportunity';

import { BuyingOpportunityService } from 'src/app/services/data/buyingopportunity.service';
import { SideModalService } from 'src/app/services/side-modal.service';

import { Share } from '@capacitor/share';
import { GoogleAnalytics } from 'src/app/decorators/ga';

@UntilDestroy()
@Component({
  selector: 'app-contactsellers',
  templateUrl: './contactsellers.page.html',
  styleUrls: ['./contactsellers.page.scss'],
})
export class ContactsellersPage implements OnInit {

  @Input() opportunity: BuyingOpportunity;

  showOfferForm = false;
  newForm: FormGroup;
  flagFavorite: boolean;

  otherProductionsFromSeller$: Observable<BuyingOpportunity[]>; //  = [];

  constructor(
    private sideModalController: SideModalService,
    private buyingopportunityService: BuyingOpportunityService,
    private alertController: AlertController,
    private fb: FormBuilder,
    private platform: Platform
  ) {
    this.newForm =
      this.fb.group({
        offerPrice: ['',
          Validators.compose(
            [Validators.required]
          )],
        offerDescription: ['',
          Validators.compose(
            [Validators.required]
          )],
        offerQuantity: ['',
          Validators.compose(
            [Validators.required]
          )],
      });
  }


  ngOnInit() {
  }

  @GoogleAnalytics('contactseller')
  ionViewWillEnter() {

    this.flagFavorite = this.opportunity.flagFavorite;

    // update last view only if we are on a different day - to avoid too many writes to the server
    const opportunityData: BuyingOpportunity = this.buyingopportunityService.clone(this.opportunity);
    const opportunityDate = new Date(0);
    opportunityDate.setUTCSeconds(opportunityData.lastViewed);
    const today = new Date();
    const opportunityDateString = opportunityDate.toLocaleDateString();
    const todayDateString = today.toLocaleDateString();

    if (opportunityDateString !== todayDateString) {
      opportunityData.lastViewed = Date.now();
      this.buyingopportunityService.upsert(opportunityData);
    }

    this.otherProductionsFromSeller$ = this.buyingopportunityService.getPublishedOpportunities$()
      .pipe(
        map(opportunities =>
          opportunities.filter(opportunity =>
            this.opportunity.sellerUserID === opportunity.sellerUserID &&
            this.opportunity.buyingOpportunityID !== opportunity.buyingOpportunityID
          )));
  }

  @GoogleAnalytics('contactseller')
  async contactSeller() {
    this.buyingopportunityService.contactedSeller(this.opportunity);

    const alert = await this.alertController.create({
      //    cssClass: 'my-custom-class',
      header: 'WhatsApp contact',
      message: `Do you want to contact ${this.opportunity.sellerUserDisplayName} via WhatsApp?`,
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
            //    this.sideModalController.dismiss();
          }
        }, {
          text: 'Okay',
          handler: (data: { line: string }) => {
            console.log('ContactbuyersPage contactBuyer', this.opportunity);
            //    this.sideModalController.dismiss();

            let line = `Hi ${this.opportunity.sellerUserDisplayName}, I am interested in ${this.opportunity.commodity} which you offer on Kuyua.`;
            if (this.opportunity.countOfContacts > 0) {
              line = `Hi ${this.opportunity.sellerUserDisplayName}`;
            }
            //   if (data.line.length === 0) {
            //   }
            // const whapURL = `whatsapp://send?phone=${this.opportunity.sellerUserWhatsAppNr}&text=${data.line}`;
            let whapURL = `whatsapp://send?phone=${this.opportunity.sellerUserWhatsAppNr}&text=${line}`;
            // whapURL = `https://wa.me/${this.opportunity.sellerUserWhatsAppNr}?text=${data.line}&text&app_absent=0`;

            if (this.platform.is('desktop')) {
              whapURL = `https://web.whatsapp.com/send?phone=${this.opportunity.sellerUserWhatsAppNr}?text=${line}&app_absent=0`;
            }
            // https://web.whatsapp.com/send?phone=%2B31622414799&text&app_absent=0

            //            const whapURL = `https://wa.me/${this.opportunity.sellerUserWhatsAppNr}?text=${data.line}`;

            this.openWhatsApp(whapURL);
            window.open(whapURL); // 'https://wa.me/31622414799?text=Hi!');

            // https://web.whatsapp.com/send?phone=0000000000000
            // whatsapp:// send?phone=0000000000000
            // https://api.whatsapp.com/send?phone=+910000000000&text=Hi, I contacted you Through your website.
          }
        }
      ]
    });
    await alert.present();
  }

  @GoogleAnalytics('contactseller')
  openWhatsApp(whapURL: string) {
    //     whapURL = `https://web.whatsapp.com/send?phone=${this.opportunity.sellerUserWhatsAppNr}?text=${data.line}&app_absent=0`;

    //    https://web.whatsapp.com/send?phone=%2B31622414799&text&app_absent=0
    window.open(whapURL); // 'https://wa.me/31622414799?text=Hi!');
  }


  @GoogleAnalytics('contactseller')
  async contactOtherProductOfSeller(opportunity: BuyingOpportunity) {

    this.sideModalController.dismiss();
    const modal = await this.sideModalController.create({
      component: ContactsellersPage,
      cssClass: 'fullscreen-modal',
      //  event: ev,
      componentProps: { opportunity },
      //     translucent: true
    });
    return await modal.present();
  }


  closeModal() {
    /*
        if (this.opportunity.flagFavorite !== this.flagFavorite) {
          if (this.flagFavorite) {
            this.buyingopportunityService.upsert(this.opportunity);
          }
        }
    */
    this.sideModalController.dismiss();
  }

  // https://kuyua.com/login/opportunity/uid1629025653680.1544246711002.7134-bOPvluFVR0ZCjCAXXRxxoaxaSCn2
  @GoogleAnalytics('contactseller')
  async shareBuyingOpportunity(opportunity: BuyingOpportunity) {

    const shareRet = await Share.share({
      title: 'See cool stuff',
      text: `Hey there! Please check out ${this.opportunity.commodity} for sale on Kuyua\n\n Really cool stuff and share along!! 🚀🚀🚀\n\n`,
      url: 'https://kuyua.com/login/opportunity/' + this.opportunity.buyingOpportunityID,
      dialogTitle: 'Share with your buddies'
    });
  }
}
/*

  presentOfferToSeller() {
    this.showOfferForm = true;
  }

  submitOffer() {
    this.closeModal();
  }

  closeButKeepTracking() {
    this.buyingopportunityService.updatePropOfEntity(
      { prop: 'flagFavorite', value: true },
      this.opportunity.buyingOpportunityID
    );
  }


    closeNotInterested() {
    this.buyingopportunityService.tagNotInterested(this.opportunity);
    this.sideModalController.dismiss();
  }

  closeKeepInterested() {
    this.sideModalController.dismiss();
  }

<ng-container *ngIf="showOfferForm">
CODE TO WORK ON
<ion-button expand="full" (click)="presentOfferToSeller()">
    Present offer to seller
</ion-button>

<ion-item>
    <ion-label position="stacked">Price you offer</ion-label>
    <ion-input placeholder="Enter value" formControlName="offerPrice"></ion-input>
</ion-item>
<ion-item>
    <ion-label position="stacked">Provide additional description</ion-label>
    <ion-input placeholder="Enter value" formControlName="offerDescription"></ion-input>
</ion-item>
<ion-item>
    <ion-label position="stacked">How much do you want to buy (quantity)</ion-label>
    <ion-input placeholder="Enter value" formControlName="offerQuantity"></ion-input>
</ion-item>
<ion-button [disabled]="!newForm.valid" expand="full" (click)="submitOffer()">
    Submit offer to seller
</ion-button>
</ng-container>
<br>


rules_version = '2';
service firebase.storage {
 match /b/{bucket}/o {
    match /images/{userId}/{allImages=**} {
       allow write: if request.resource.size < 0.5 * 1024 * 1024
                    && request.resource.contentType.matches('image/.*')
                    && request.auth.uid == userId;
       allow read: if request.auth != null;
   }
 }
}

rules_version = '2';
service firebase.storage {
 match /b/{bucket}/o {
    match /images/{userId}/{imageId} {
      allow write: if request.resource.size < 0.5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*')
                   && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
 }
}

*/
