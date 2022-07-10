import { Injectable } from '@angular/core';

import { BuyingOpportunity, BuyingOpportunityProps } from '../../interfaces/BuyingOpportunity';
import { FirebaseService } from '../firebase.service';

import { User } from 'src/app/interfaces/user';
import { UserService } from './user.service';
import { BuyingInterest, BuyingInterestProps } from 'src/app/interfaces/buyinginterest';

import { RealtimeRemoteStateService } from './realtime-remote.state.class';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CountryService } from './country.service';

@Injectable({
  providedIn: 'root'
})
export class BuyingOpportunityService extends RealtimeRemoteStateService<BuyingOpportunity> {

  private buyingOpportunitiesCache$ = new BehaviorSubject<Array<BuyingOpportunity>>([]);
  private publishedOpportunitySubscription: Subscription;

  constructor(
    protected firebaseService: FirebaseService,
    private userService: UserService,
    private countryService: CountryService,
  ) {
    super('buyingOpportunityID', '/users/[UID]/mybuyingopportunities/', firebaseService);
    this.setEntityProperties(BuyingOpportunityProps);
    this.setupPublishedMonitoring();
  }

  setupPublishedMonitoring() {
    this.firebaseService.getAuthObject()
      .onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          this.publishedOpportunitySubscription = this.userService.getUser$()
            .pipe(
              filter(user => user !== undefined),
              switchMap(user => {
                const userMarkets = this.userService.userIsAdmin() ? this.countryService.getAllCountryIDs() : user.marketsOfInterest;
                return this.firebaseService
                  .collection('/publishedbuyingopportunities/',
                    ref => ref
                      .where('sellerUserID', '!=', user.userID)
                      .where('market', 'in', userMarkets))
                  .snapshotChanges()
                  .pipe(
                    map(actions => actions.map(a => {
                      const data = a.payload.doc.data() as BuyingOpportunity;
                      return { ...data };
                    })));
              }))
            .subscribe(opportunitiesPublished => {
              //   console.log('Retrieved published opportunities ', opportunitiesPublished);

              // we amend the published data to also include data regarding the actions of the current user
              this.buyingOpportunitiesCache$.next(opportunitiesPublished);
              /*
                opportunitiesPublished.map(opportunity => {
                  const toMergeData = this.state.entityMap[opportunity.buyingOpportunityID];
                  if (toMergeData !== undefined) {
                    return { ...opportunity, lastViewed: toMergeData.lastViewed };
                  } else {
                    return opportunity;
                  }
                }));
                */
            },
              err => {
                console.log('Error getting collection ' + this.uidKey, err);
              });
        }

        if (!firebaseUser) {
          if (this.publishedOpportunitySubscription) {
            this.buyingOpportunitiesCache$.next([]);
            this.publishedOpportunitySubscription.unsubscribe();
          }
        }
      });
  }

  getBuyingOpportunities$() {
    //     console.log('SADSDA', this.state);
    return this.getEntitiesAsArray$();
  }

  getPublishedOpportunities$() {
    return this.buyingOpportunitiesCache$.asObservable()
      // we need to know what we have done earlier on a published opportunity, if at all available
      // so we merge data
      .pipe(
        switchMap(publishedOpportunities => {
          return this.getBuyingOpportunities$()
            .pipe(map(opportunitiesOfInterest => {
              return publishedOpportunities.map(pOpp => {
                const toMergeData = opportunitiesOfInterest.find(element => element.buyingOpportunityID === pOpp.buyingOpportunityID);

                if (toMergeData !== undefined) {
                  return { ...pOpp, lastViewed: toMergeData.lastViewed };
                } else {
                  return pOpp;
                }
              });
            }));
        })
      );


    /*
    return this.firebaseService
      .collection('/publishedbuyingopportunities/')
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as BuyingOpportunity;
          return { ...data };
        }),
          tap((opportunities: BuyingOpportunity[]) => {
            this.publishedBuyingOpportunities = {};
            opportunities.forEach(opportunity => {
              this.publishedBuyingOpportunities[opportunity.buyingOpportunityID] = opportunity;
            });
          })),
      );
  */
  }

  tagNotInterested(opportunity: BuyingOpportunity) {
    this.deleteID(opportunity.buyingOpportunityID);
  }

  contactedSeller(opportunity: BuyingOpportunity) {
    const clone: BuyingOpportunity = this.clone(opportunity);
    clone.countOfContacts += 1;
    clone.lastContact = Date.now();
    clone.flagFavorite = true;

    if (clone.countOfContacts === 1) {
      this.publishInterestToSeller(clone);
    }

    this.upsert(clone);
  }

  publishInterestToSeller(opportunity: BuyingOpportunity) {
    const user = this.userService.peekUser();
    const buyinginterest = this.convertBuyingOpportunityToInterest(opportunity, user);
    const firebaseSavePath = '/users/' + opportunity.sellerUserID + '/postedinterests/' + buyinginterest.buyingInterestID;
    this.firebaseService.doc(firebaseSavePath).set(buyinginterest);
  }

  republishBuyingInterests(user: User) {
    const batch = this.firebaseService.batch();
    //  const user = this.userService.peekUser();

    for (const id of Object.keys(this.state.entityMap)) {
      if (this.state.entityMap[id].countOfContacts > 0) {
        const opportunity = { ...this.state.entityMap[id] };
        const buyinginterest = this.convertBuyingOpportunityToInterest(opportunity, user);
        const firebaseSavePath = '/users/' + opportunity.sellerUserID + '/postedinterests/' + buyinginterest.buyingInterestID;

        console.log('SETTING interest', opportunity, buyinginterest.buyingInterestID);
        batch.set(this.firebaseService.doc(firebaseSavePath).ref, buyinginterest);
      }
    }
    return batch.commit().catch(err => { console.log('ERRRRRR republish interest', err); });
  }

  convertBuyingOpportunityToInterest(p: BuyingOpportunity, user: User): BuyingInterest {
    return this.validateWithProps({
      ...p,
      buyingInterestID: p.buyingOpportunityID + user.userID,
      buyerUserID: user.userID,
      buyerWhatsAppNr: user.whatsAppNr,
      buyerDisplayName: user.fullName,
      buyerPhotoURL: user.photoURL,
      productionID: p.productionID,

      buyerEmail: user.email,
      productionCommodity: p.commodity,

    }, BuyingInterestProps) as unknown as BuyingInterest;
  }
}



