import { Prop } from '../services/data/generic.state.class';

export interface Commodity {
    commodityID: string;
    name: string;
    description: string;
    photoURL: string;
    defaultUnit: string;
    defaultProductionDurations: string;
}

export const CommodityProps: Prop[] = [
    { prop: 'commodityID', def: '' },
    { prop: 'name', def: '' },
    { prop: 'description', def: '' },
    { prop: 'photoURL', def: '' },
    { prop: 'defaultUnit', def: '' },
    { prop: 'defaultProductionDurations', def: '' },
];
