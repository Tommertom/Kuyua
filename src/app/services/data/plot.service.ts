import { Injectable } from '@angular/core';

import { Plot, PlotProps } from '../../interfaces/plot';
import { FirebaseService } from '../firebase.service';

import { RealtimeRemoteStateService } from './realtime-remote.state.class';

@Injectable({
  providedIn: 'root'
})
export class PlotService extends RealtimeRemoteStateService<Plot> {

  constructor(protected firebaseService: FirebaseService) {
    super('plotID', '/users/[UID]/plots/', firebaseService);
    this.setEntityProperties(PlotProps);
  }

  getPlots$() {
    return this.getEntitiesAsArray$();
  }

  markAsArchived(plot: Plot) {
    this.updatePropsOfEntity([{ prop: 'archived', value: true }], plot.plotID);
  }

  updateGPS(plot: Plot, GPS: { lat: number, lng: number }) {
    this.updatePropsOfEntity([{ prop: 'GPS', value: GPS }], plot.plotID);
  }

}
