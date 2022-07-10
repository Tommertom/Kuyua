import { Prop } from '../services/data/generic.state.class';

export interface Country {
  countryID: string;
  currency: string;
  phonePrefix: string;
  defaultGPS: { lat: number, lng: number };
  flagPictureURL: string;
  defaultLanguage: string;
  phoneCode: string;
  countryName: string;
}

export const CountryProps: Prop[] = [
  { prop: 'countryID', def: '' },
  { prop: 'currency', def: '' },
  { prop: 'phoneCode', def: '' },
  { prop: 'defaultGPS', def: '' },
  { prop: 'flagPictureURL', def: '' },
  { prop: 'defaultLanguage', def: '' },
  { prop: 'defaultGPS', def: { lat: -34.397, lng: 150.644 } },
  { prop: 'phonePrefix', def: '' },
  { prop: 'countryName', def: '' },
];
