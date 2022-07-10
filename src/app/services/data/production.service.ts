import { Injectable } from '@angular/core';

import { map, switchMap } from 'rxjs/operators';

import { Production, ProductionProps } from '../../interfaces/Production';
import { FirebaseService } from '../firebase.service';
import { UserService } from './user.service';
import { BuyingOpportunity, BuyingOpportunityProps } from 'src/app/interfaces/BuyingOpportunity';

import { User } from 'src/app/interfaces/user';
import { BuyinginterestService } from './buyinginterest.service';
import { UntilDestroy } from '@ngneat/until-destroy';

import { RealtimeRemoteStateService } from './realtime-remote.state.class';
import { GoogleAnalytics } from 'src/app/decorators/ga';


@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class ProductionService extends RealtimeRemoteStateService<Production> {
  constructor(
    protected firebaseService: FirebaseService,
    private userService: UserService,
    private buyingInterestService: BuyinginterestService,
  ) {
    super('productionID', '/users/[UID]/productions/', firebaseService);
    this.setEntityProperties(ProductionProps);
  }

  getProductions$() {
    return this.getEntitiesAsArray$();
  }

  getProductionByID$(id: string) {
    return this.getState$().pipe(
      map(state => {
        return state.entityMap[id];
      })
    );
  }

  getProductionsCalculated$() {
    return this.buyingInterestService.getInterestProductionMap$()
      .pipe(switchMap(
        interestProductionMap => {
          return this.getEntitiesAsArray$()
            .pipe(map(productions => {
              return productions.map(production => {
                if (typeof interestProductionMap[production.productionID] !== 'undefined') {
                  return {
                    ...production,
                    numberOfPotentialBuyers: interestProductionMap[production.productionID]
                  };
                } else {
                  return production;
                }
              });
            }));
        }
      ));
  }

  getProductionsByPlotID(plotID: string) {
    return this.entitiesAsArray$
      .asObservable()
      .pipe(
        map((productions) =>
          productions.filter((production) => production.plotID === plotID)
        )
      );
  }

  markQuantitySold(production: Production, amount: number): Production {
    const newProduction = this.clone(production);

    newProduction.expectedQuantity -= amount;
    newProduction.soldQuantity += amount;

    if (newProduction.expectedQuantity === 0) {
      newProduction.isSold = true;
      newProduction.isForSale = false;
    }
    newProduction.publishToOthers = true;

    return newProduction;
  }

  markAsArchived(production: Production) {
    this.updatePropsOfEntity([
      { prop: 'isForSale', value: false },
      { prop: 'archived', value: true },
    ], production.productionID);


    const newProduction = this.clone(production);
    newProduction.isForSale = false;
    newProduction.arhived = true;
    this.syncPublishedOfProduction(newProduction);
  }

  // @GoogleAnalytics('productionservice')
  async syncPublishedOfProduction(production: Production) {
    const user = this.userService.peekUser();
    const { userID } = user;
    const opportunity = { ... this.convertProductionToBuyingOpportunity(production, user) };

    if (production.isForSale && !production.archived) {
      await this.firebaseService.doc('/publishedbuyingopportunities/' + opportunity.buyingOpportunityID).set(opportunity);
    }

    if (!production.isForSale) {
      await this.firebaseService.doc('/publishedbuyingopportunities/' + opportunity.buyingOpportunityID).delete();
    }
  }


  deleteAll() {
    const user = this.userService.peekUser();
    const { userID } = user;
    const firestoreBatch = this.getFirestoreBatch();

    for (const entitiyID of Object.keys(this.state.entityMap)) {
      const productionIsForSale = this.state.entityMap[entitiyID].isForSale;
      if (productionIsForSale) {
        const opportunity = { ... this.convertProductionToBuyingOpportunity(this.state.entityMap[entitiyID], user) };
        firestoreBatch.delete(this.firebaseService.doc('/publishedbuyingopportunities/' + opportunity.buyingOpportunityID).ref);
      }
      firestoreBatch.delete(this.firebaseService.doc(this.remotePath + entitiyID).ref);
    }
    return this.commitFirestoreBatch(firestoreBatch);
  }

  republishProductionsForSale(user: User) {
    const batch = this.firebaseService.batch();
    //  const user = this.userService.peekUser();

    for (const id of Object.keys(this.state.entityMap)) {
      const production = { ...this.state.entityMap[id] };
      const opportunity = { ... this.convertProductionToBuyingOpportunity(production, user) };

      if (this.state.entityMap[id].isForSale && !this.state.entityMap[id].archived) {
        //     console.log('RESETTING222', opportunity, opportunity.buyingOpportunityID, opportunity.sellerUserID, user.userID);
        batch.set(this.firebaseService.doc('/publishedbuyingopportunities/' + opportunity.buyingOpportunityID).ref, opportunity);
      }
      if (!this.state.entityMap[id].isForSale) {
        //   console.log('DELETING', opportunity);
        batch.delete(this.firebaseService.doc('/publishedbuyingopportunities/' + opportunity.buyingOpportunityID).ref);
      }
    }
    return batch.commit();
  }

  convertProductionToBuyingOpportunity(p: Production, user: User): BuyingOpportunity {
    const buyingOpportunityID = p.productionID + '-' + user.userID;
    return this.validateWithProps({
      ...p,
      buyingOpportunityID,
      plotGPS: p.GPS,
      commodity: p.commodityName,
      commodityDetails: p.details,
      sellerUserDisplayName: user.fullName,
      sellerUserWhatsAppNr: user.whatsAppNr,
      sellerUserPhotoURL: user.photoURL,
      sellerUserID: user.userID,
      sellerEmail: user.email,
      userIsInterested: true,   // needs to be true, so it shows at the buyer's end -- 20210831 probably needs to be removed
      userID: user.userID,
      productionID: p.productionID,
      commodityQuantity: p.expectedQuantity,

    }, BuyingOpportunityProps) as unknown as BuyingOpportunity;
  }

}

/*




     // working :  if get(/databases/$(database)/documents/confirmcodes/$(request.auth.uid)).data.emailConfirmed;
    // allow update,delete: if exists(/databases/$(database)/documents/publishedbuyingopportunities/$(documentID));
   //   allow update, delete: if get(/databases/$(database)/documents/confirmcodes/$(request.auth.uid)).data.emailConfirmed;

     // if get(/databases/$(database)/documents/publishedbuyingopportunities/$(documentID)).data.sellerUserID  == null;

*/
