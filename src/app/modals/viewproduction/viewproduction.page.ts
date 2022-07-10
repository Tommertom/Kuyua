import { Component, OnInit, Input } from '@angular/core';
import { Production } from 'src/app/interfaces/Production';
import { AlertController, ModalController } from '@ionic/angular';
import { ProductionService } from 'src/app/services/data/production.service';
import { InAppMessagesService } from 'src/app/services/in-app-messages.service';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { FirebaseService } from 'src/app/services/firebase.service';

import { AngularFireAnalytics } from '@angular/fire/analytics';
import { UserService } from 'src/app/services/data/user.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, first, take } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';

import { Clipboard } from '@capacitor/clipboard';
import { Share } from '@capacitor/share';
import { GoogleAnalytics } from 'src/app/decorators/ga';

@UntilDestroy()
@Component({
  selector: 'app-viewproduction',
  templateUrl: './viewproduction.page.html',
  styleUrls: ['./viewproduction.page.scss'],
})
export class ViewproductionPage implements OnInit {

  @Input() production: Production;

  newForm: FormGroup;

  user: User;

  constructor(
    private modalCtrl: ModalController,
    private productionService: ProductionService,
    private fb: FormBuilder,
    private userService: UserService,
  ) { }

  ngOnInit() {
    console.log('Production view', this.production);

    this.newForm =
      this.fb.group({
        details: ['',
          Validators.compose(
            [Validators.required, Validators.min(5)]
          )],
        commodityName: ['',
          Validators.compose(
            [Validators.required]
          )],
        expectedQuantity: ['',
          Validators.compose(
            [Validators.required]
          )],
        soldQuantity: ['',
          Validators.compose(
            [Validators.required]
          )],
        isForSale: [false,
          Validators.compose(
            [Validators.required]
          )],
      });
    //  this.newForm.patchValue(this.production);


    this.productionService.getProductionByID$(this.production.productionID)
      .pipe(untilDestroyed(this), filter(production => production !== undefined))
      .subscribe(production => {
        //    this.production = production;
        //   this.newForm.patchValue(production);
      });

    this.userService.getUser$()
      .pipe(untilDestroyed(this),
        take(1)
        // first()
      )
      .subscribe(user => {
        this.user = user;
      });

    this.newForm.patchValue(this.production);
  }

  @GoogleAnalytics('viewproduction')
  ionViewDidEnter() {
  }

  cancelModal() {
    this.modalCtrl.dismiss();
  }

  async closeAndSaveModal() {
    this.modalCtrl.dismiss();

    if (this.newForm.dirty) {

      this.modalCtrl.dismiss();
      const newProduction = this.productionService.validate({
        ...this.production,
        ...this.newForm.value,
      });

      if (this.newForm.controls.isForSale.value !== this.production.isForSale) {
        await this.productionService.syncPublishedOfProduction(newProduction);
      }

      this.productionService.upsert(newProduction);
    }
  }

  @GoogleAnalytics('viewproduction')
  async shareBuyingOpportunity(production: Production) {

    const opportunity = this.productionService.convertProductionToBuyingOpportunity(production, this.user);

    if (!production.isForSale) {
      await this.productionService.syncPublishedOfProduction(production);
      this.newForm.controls.isForSale.patchValue(true);
    }

    const shareRet = await Share.share({
      title: 'See cool stuff',
      text: `Hey there! Please check out ${opportunity.commodity} for sale on Kuyua\n\n Really cool stuff and share along!! 🚀🚀🚀\n\n`,
      url: 'https://kuyua.com/login/opportunity/' + opportunity.buyingOpportunityID,
      dialogTitle: 'Share with your buddies'
    });
  }
}

/*


  markFullySold() {
    const newProduction = this.productionService.markQuantitySold(this.production, this.production.expectedQuantity);
    this.newForm.patchValue(newProduction);
    this.closeAndSaveModal();
  }

  async markPartiallySold(whom?: string) {
    const alert = await this.alertController.create({
      //  cssClass: 'my-custom-class',
      header: 'How much did you sell?',
      inputs: [
        {
          name: 'toWhom',
          type: 'text',
          value: whom,
          placeholder: 'To whom?'
        },
        {
          name: 'expectedQuantity',
          type: 'number',
          placeholder: 'How much sold (max ' + this.newForm.controls.expectedQuantity.value + ')?',
          min: 0,
          max: this.newForm.controls.expectedQuantity.value
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            console.log('Confirm Ok', data);
            if (data) {
              const { toWhom } = data;
              let { expectedQuantity } = data;
              if (!isNaN(expectedQuantity)) {

                expectedQuantity = parseFloat(expectedQuantity);
                if (expectedQuantity <= this.newForm.controls.expectedQuantity.value) {
                  const newProduction = this.productionService.markQuantitySold(this.production, expectedQuantity);

                  this.newForm.patchValue(newProduction);

                  this.productionService.upsert(
                    this.productionService.validate({
                      ...this.production,
                      ...this.newForm.value
                    }));
                } else {
                  this.inAppMessage.presentToast('Incorrent amount supplied');
                  alert.dismiss();
                  this.markPartiallySold(toWhom);
                }
              } else {
                this.inAppMessage.presentToast('Incorrent amount supplied');
                alert.dismiss();
                this.markPartiallySold(toWhom);
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }


   productionStart: [0,
          Validators.compose(
            [Validators.required]
          )],
        productionEnd: [0,
          Validators.compose(
            [Validators.required]
          )],

  <ion-item>
            <ion-label position="floating">Expected harvesting date</ion-label>
            <ion-datetime value="1990-02-19" placeholder="Select Date" formControlName="productionEnd">
            </ion-datetime>
        </ion-item>

    <br><br>

        <ion-item>
            <ion-label position="floating">Planting date</ion-label>
            <ion-datetime value="1990-02-19" formControlName="productionStart" placeholder="Select Date">
            </ion-datetime>
        </ion-item>


    <br>
    <ion-button *ngIf="!production.archived && !production.isSold" expand="full" (click)="markFullySold()">Mark fully sold
    </ion-button>


      <h3>Production end: {{production.productionEnd|date:'longDate'}} - Production start: {{production.productionStart |date:'longDate'}}
            </h3>
*/
