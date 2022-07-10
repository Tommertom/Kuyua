import { Prop } from '../services/data/generic.state.class';

export interface Plot {
    plotID: string;
    GPS: { lat: number, lng: number };
    description: string;
    userID: string;
    sizeInAcres: number;
    archived: boolean;
    country: string;
}

export const PlotProps: Prop[] = [
    { prop: 'plotID', def: '' },
    { prop: 'GPS', def: { lat: 0.3208730561416851, lng: 32.580959738168175 } },
    { prop: 'description', def: '' },
    { prop: 'userID', def: '' },
    { prop: 'sizeInAcres', def: 0 },
    { prop: 'archived', def: false },
];

