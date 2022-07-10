import { Prop } from '../services/data/generic.state.class';
import { Offer } from './offer';

export interface BuyingOpportunity {
  market: string;
  isUpdated: boolean;
  //  updatedFields: string[];
  archived: boolean;
  buyingOpportunityID: string;
  photoURL: string;
  commodityID: string;
  commodity: string;
  commodityDetails: string;
  commodityUnit: string;
  commodityQuantity: number;
  commodityUnitPrice: number;
  commodityUnitCurrency: string;
  // productionEnd: number;
  productionID: string;
  plotGPS: { lat: number, lng: number };
  sellerUserDisplayName: string;
  sellerUserWhatsAppNr: string;
  sellerUserPhotoURL: string;
  sellerUserID: string;
  sellerEmail: string;
  userIsInterested: boolean;
  flagFavorite: boolean;
  countOfContacts: number;
  lastContact: number;
  lastViewed: number;
  presentedOffersToSeller: Offer[];
  receivedOffersFromSeller: Offer[];
  creationDate: number;
  // publishedToSeller: boolean;
  //  lastUpdateAt: firebase.firestore.FieldValue | number; //lastUpdateAt: firebase.firestore.FieldValue.serverTimestamp()
}

export const BuyingOpportunityProps: Prop[] = [
  { prop: 'market', def: '' },
  { prop: 'buyingOpportunityID', def: '' },
  { prop: 'lastViewed', def: 0 },
  { prop: 'isUpdated', def: false },
  // { prop: 'updatedFields', def: [] },
  { prop: 'commodity', def: '' },
  { prop: 'photoURL', def: '' },
  { prop: 'commodityID', def: '' },
  { prop: 'commodityDetails', def: '' },
  { prop: 'commodityUnit', def: '' },
  { prop: 'commodityQuantity', def: 0 },
  { prop: 'commodityUnitPrice', def: 0 },
  { prop: 'commodityUnitCurrency', def: '' },
  { prop: 'productionID', def: '' },
  // { prop: 'productionEnd', def: 0 },
  { prop: 'plotGPS', def: { lat: -34.397, lng: 150.644 } },
  { prop: 'sellerUserDisplayName', def: '' },
  { prop: 'sellerUserWhatsAppNr', def: '' },
  { prop: 'sellerUserPhotoURL', def: '' },
  { prop: 'sellerUserID', def: '' },
  { prop: 'sellerEmail', def: '' },
  { prop: 'archived', def: false },
  { prop: 'userIsInterested', def: false },
  { prop: 'flagFavorite', def: false },
  { prop: 'countOfContacts', def: 0 },
  { prop: 'lastContact', def: 0 },
  // { prop: 'publishedToSeller', def: false },
  { prop: 'presentedOffersToSeller', def: [] },
  { prop: 'receivedOffersFromSeller', def: [] },
  //  { prop: 'lastUpdateAt', def: 0 },
  { prop: 'creationDate', def: 0 },
];
