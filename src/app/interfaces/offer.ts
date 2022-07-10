import { Prop } from '../services/data/generic.state.class';

export interface Offer {
  offerCurrency: string;
  offerPrice: string;
  offerDate: number;
  offerDescription: string;
  offerQuantity: string;
  offerSeen: boolean;
}

export const PurchaseProps: Prop[] = [
  { prop: 'offerCurrency', def: '' },
  { prop: 'offerPrice', def: '' },
  { prop: 'offerDate', def: 0 },
  { prop: 'offerDescription', def: '' },
  { prop: 'offerQuantity', def: '' },
  { prop: 'offerSeen', def: false },
];
