import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { map, take } from 'rxjs/operators';

import { GoogleAnalytics } from 'src/app/decorators/ga';
import { BuyinginterestService } from 'src/app/services/data/buyinginterest.service';
import { BuyingOpportunityService } from 'src/app/services/data/buyingopportunity.service';
import { PlotService } from 'src/app/services/data/plot.service';
import { ProductionService } from 'src/app/services/data/production.service';
import { UserService } from 'src/app/services/data/user.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { arrayToCSV, downloadInput } from 'src/app/utils/helpers';


interface ConfirmCode {
  userID: string;
  age: number;
  confirmCode: number;
  email: string;
  emailConfirmed: boolean;
}

@Component({
  selector: 'app-experimental',
  templateUrl: './experimental.page.html',
  styleUrls: ['./experimental.page.scss'],
})
export class ExperimentalPage implements OnInit {

  constructor(
    private modalCtrl: ModalController,
    private firebaseService: FirebaseService,
    private buyingOpportunities: BuyingOpportunityService,
    private userService: UserService,
    private productionService: ProductionService,
    private buyingInterestService: BuyinginterestService,
    private plotService: PlotService,
  ) { }

  ngOnInit() {
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async exportUserList() {
    const confirmCodes = await this.firebaseService.collection('/confirmcodes').snapshotChanges().pipe(
      take(1),
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { userID: id, ...data } as ConfirmCode;
      })))
      .toPromise();

    if (confirmCodes.length > 0) {
      const fileName = 'userList' + Date.now() + '.csv';
      downloadInput(arrayToCSV(confirmCodes, '|'), 'text/plain', fileName);
    }
  }

  async downloadAllOpportunities() {
    const opportunities = await this.buyingOpportunities.getBuyingOpportunities$().pipe(
      take(1))
      .toPromise();

    if (opportunities.length > 0) {
      const fileName = 'opportunities' + Date.now() + '.csv';
      downloadInput(arrayToCSV(opportunities, '|'), 'text/plain', fileName);
    }
  }

  async deleteUser() {


    return;


    await this.buyingOpportunities.deleteAll();
    await this.buyingInterestService.deleteAll();
    await this.plotService.deleteAll();
    await this.productionService.deleteAll();
    await this.userService.deleteAll();

    const user = await this.firebaseService.getAuthObject().currentUser;

    user.delete().then(() => {
      console.log('USER DELETE OK');
      // User deleted.
    }).catch((error) => {

      console.log('ERRROR', error);
      // An error ocurred
      // ...
    });


  }
}
