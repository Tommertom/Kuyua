import { Prop } from '../services/data/generic.state.class';
import { Offer } from './offer';

export interface BuyingInterest {
  buyingInterestID: string;
  buyerUserID: string;
  buyerWhatsAppNr: string;
  buyerDisplayName: string;
  buyerPhotoURL: string;
  buyerEmail: string;
  buyingCurrency: string;
  buyingPrice: number;
  buyingDate: number;
  productionID: string;
  archived: boolean;
  presentedOffersToBuyer: Offer[];
  receivedOffersFromBuyer: Offer[];
  productionCommodity: string;
  sellerEmail: string;
  lastContact: number;
  // lastUpdateAt: firebase.firestore.FieldValue | number; // lastUpdateAt: firebase.firestore.FieldValue.serverTimestamp()
}

export const BuyingInterestProps: Prop[] = [
  { prop: 'buyingInterestID', def: '' },
  { prop: 'buyerUserID', def: '' },
  { prop: 'buyerWhatsAppNr', def: '' },
  { prop: 'buyerDisplayName', def: '' },
  { prop: 'buyerPhotoURL', def: '' },
  { prop: 'buyingCurrency', def: '' },
  { prop: 'buyingPrice', def: 0 },
  { prop: 'buyingDate', def: 0 },
  { prop: 'productionID', def: '' },
  { prop: 'archived', def: false },
  { prop: 'presentedOffersToBuyer', def: [] },
  { prop: 'receivedOffersFromBuyer', def: [] },
  //  { prop: 'lastUpdateAt', def: 0 },
  { prop: 'productionCommodity', def: '' },
  { prop: 'buyerEmail', def: '' },
  { prop: 'sellerEmail', def: '' },
  { prop: 'lastContact', def: 0 },
];
