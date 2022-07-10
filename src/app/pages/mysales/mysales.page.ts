import { Component, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { IonItemSliding, ModalController } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { filter, first, map, take } from 'rxjs/operators';
import { GoogleAnalytics } from 'src/app/decorators/ga';
import { MessageTypes } from 'src/app/interfaces/message';
import { Production } from 'src/app/interfaces/Production';
import { User } from 'src/app/interfaces/user';
import { ContactbuyersPage } from 'src/app/modals/contactbuyers/contactbuyers.page';
import { ProductionService } from 'src/app/services/data/production.service';
import { UserService } from 'src/app/services/data/user.service';
import { InAppMessagesService } from 'src/app/services/in-app-messages.service';

@UntilDestroy()
@Component({
  selector: 'app-mysales',
  templateUrl: './mysales.page.html',
  styleUrls: ['./mysales.page.scss'],
})
export class MysalesPage implements OnInit {

  user: User;

  productionsForSale$: Observable<Production[]>;

  skeletonItems = [0, 1];

  constructor(
    private productionService: ProductionService,
    private modalController: ModalController,
    private userService: UserService,
    private inAppMessageService: InAppMessagesService,
  ) {
    this.user = this.userService.validate({});
  }

  ngOnInit() {
    this.productionsForSale$ =
      this.productionService
        .getProductionsCalculated$()
        .pipe(
          map(productions =>
            productions
              .filter(production => production.isForSale)));
    this.userService.getUser$()
      .pipe(untilDestroyed(this))
      .subscribe(user => { this.user = user; });
  }


  async contactBuyer(production: Production, buyerToFlagID?: string) {
    console.log('Show buyer ', production, buyerToFlagID);
    const modal = await this.modalController.create({
      component: ContactbuyersPage,
      cssClass: 'fullscreen-modal',
      //  event: ev,
      componentProps: { production, buyerToFlagID },
      // translucent: true
    });
    return await modal.present();
  }

  // https://localhost:8100/login/tom.gruintjes@gmail.com/viewbuyer/uid1628279892702.1196624051419.4888-iQE9CrxkSuONgM4QAMJTtliBMy13
  // https://localhost:8100/login/tom.gruintjes@gmail.com/viewbuyer/uid1628181266811.1349397926008.6497

  // https://localhost:8100/login/tom.gruintjes@gmail.com/viewbuyer/uid1628181266811.1349397926008.6497-iQE9CrxkSuONgM4QAMJTtliBMy13

  @GoogleAnalytics('mysales')
  ionViewDidEnter() {

    this.inAppMessageService.getFirstMessageOfType$(MessageTypes.ViewInterestedBuyer)
      .subscribe(async message => {

        if (message === undefined) {
          return;
        }

        // ugly subscribe in subscribe
        this.productionService.getProductions$()
          .pipe(
            filter(productions => productions.length > 0),
            take(1)
          )
          .subscribe(async productions => {

            const params = message.payload.split('-');
            if (params.length !== 2) {
              return;
            }
            const production = this.productionService.peekValue(params[0]);
            console.log('Processing message', message, production);

            if (production !== undefined) {
              await this.contactBuyer(production, params[1]);
              this.inAppMessageService.removeMessagesOfType(MessageTypes.ViewInterestedBuyer);
            }
          });
      });
  }


  @GoogleAnalytics('mysales')
  async unpublishOpportunity(production: Production, slider: IonItemSliding) {
    if (slider) {
      slider.close();
    }

    const newProduction: Production = this.productionService.clone(production);
    newProduction.isForSale = false;
    this.productionService.upsert(newProduction);
    await this.productionService.syncPublishedOfProduction(production);
  }
}
