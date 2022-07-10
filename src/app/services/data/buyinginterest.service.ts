import { Injectable } from '@angular/core';


import { BuyingInterest, BuyingInterestProps } from '../../interfaces/buyinginterest';
import { FirebaseService } from '../firebase.service';
import { UserService } from './user.service';
import { BehaviorSubject, Subscription } from 'rxjs';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InAppMessagesService } from '../in-app-messages.service';
import { RealtimeRemoteStateService } from './realtime-remote.state.class';
import { GenericState } from './generic.state.class';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class BuyinginterestService extends RealtimeRemoteStateService<BuyingInterest> {

  private productionInterestMap$ = new BehaviorSubject<{ [id: string]: number }>({});

  constructor(
    protected firebaseService: FirebaseService,
  ) {
    super('buyingInterestID', '/users/[UID]/postedinterests/', firebaseService);
    this.setEntityProperties(BuyingInterestProps);
  }

  getBuyinginterests$() {
    return this.getEntitiesAsArray$();
  }

  getInterestProductionMap$() {
    return this.productionInterestMap$.asObservable();
  }

  protected emitAndSave(newState: GenericState<BuyingInterest>) {
    super.emitAndSave(newState);

    const productionInterestMap = {};

    Object.keys(this.state.entityMap).forEach(id => {
      const productionID = this.state.entityMap[id].productionID;

      if (!this.state.entityMap[id].archived) {
        if (typeof productionInterestMap[productionID] === 'undefined') {
          productionInterestMap[productionID] = 1;
        } else {
          productionInterestMap[productionID] += 1;
        }
      }
    });
    this.productionInterestMap$.next(productionInterestMap);
  }

  removeInterestBuyer(interestedBuyer: BuyingInterest) {
    //   this.updatePropOfEntity({ prop: 'archived', value: true }, interestedBuyer.buyingInterestID);
    this.deleteID(interestedBuyer.buyingInterestID);
  }
}


