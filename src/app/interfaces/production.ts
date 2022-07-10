import { Prop } from '../services/data/generic.state.class';

export interface Production {
  productionID: string;
  commodityID: string;
  commodityName: string;
  details: string;
  expectedQuantity: number;
  soldQuantity: number;
  // productionEnd: string;
  // productionStart: string;
  isForSale: boolean;
  isSold: boolean;
  plotID: string;
  tags: string[];
  numberOfPotentialBuyers: number;
  GPS: { lat: number, lng: number };
  archived: boolean;
  photoURL: string;
  //  publishedToOthers: boolean;
  market: string;
  creationDate: number;
}

export const ProductionProps: Prop[] = [
  { prop: 'market', def: '' },
  { prop: 'productionID', def: '' },
  { prop: 'commodityID', def: '' },
  { prop: 'commodityName', def: '' },
  { prop: 'details', def: '' },
  { prop: 'expectedQuantity', def: 0 },
  { prop: 'soldQuantity', def: 0 },
  { prop: 'creationDate', def: 0 },
  //  { prop: 'productionEnd', def: '' },
  //  { prop: 'productionStart', def: '' },
  { prop: 'isForSale', def: false },
  { prop: 'isSold', def: false },
  { prop: 'plotID', def: '' },
  { prop: 'tags', def: [] },
  { prop: 'numberOfPotentialBuyers', def: 0 },
  { prop: 'GPS', def: { lat: -34.397, lng: 150.644 } },
  { prop: 'archived', def: false },
  { prop: 'photoURL', def: 'https://picsum.photos/200' },
  // { prop: 'publishedToOthers', def: false },
];
