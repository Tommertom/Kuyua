import { Prop } from '../services/data/generic.state.class';

export interface Price {
    priceID: string;
    priceDate: string;
    pricePerUnit: string;
    priceCurrency: string;
    commodityID: string;
}

export const PriceProps: Prop[] = [
    { prop: 'priceID', def: '' },
    { prop: 'priceDate', def: '' },
    { prop: 'pricePerUnit', def: '' },
    { prop: 'priceCurrency', def: '' },
    { prop: 'commodityID', def: '' },
];