import { Prop } from '../services/data/generic.state.class';
import { Offer } from './offer';

export interface Purchase {
  purchaseID: string;
  buyerUserID: string;
  whatsAppNr: string;
  fullName: string;
  buyingCurrency: string;
  buyingPrice: number;
  buyingDate: number;
  productionID: string;
  acceptedOffers: Offer[];
}

export const PurchaseProps: Prop[] = [
  { prop: 'purchaseID', def: '' },
  { prop: 'buyerUserID', def: '' },
  { prop: 'whatsAppNr', def: '' },
  { prop: 'fullName', def: '' },
  { prop: 'buyingCurrency', def: '' },
  { prop: 'buyingPrice', def: 0 },
  { prop: 'buyingDate', def: 0 },
  { prop: 'productionID', def: '' },
  { prop: 'acceptedOffers', def: [] },
];
