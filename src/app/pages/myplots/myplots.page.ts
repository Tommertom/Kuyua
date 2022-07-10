import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import { tap, filter, switchMap, first } from 'rxjs/operators';

import { ModalController, IonItemSliding } from '@ionic/angular';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { Observable } from 'rxjs';

import { take, map } from 'rxjs/operators';

import { Plot } from 'src/app/interfaces/plot';
import { User } from 'src/app/interfaces/user';

import { ViewplotPage } from 'src/app/modals/viewplot/viewplot.page';
import { NewplotwizardPage } from 'src/app/modals/newplotwizard/newplotwizard.page';
import { WelcomewizardPage } from 'src/app/modals/welcomewizard/welcomewizard.page';

import { UserService } from 'src/app/services/data/user.service';

import { PlotService } from 'src/app/services/data/plot.service';
import { GoogleMap } from '@angular/google-maps';

import { TestDataGeneratorService } from 'src/app/services/testdata.service';
import { environment } from 'src/environments/environment';
import { PwaService } from 'src/app/services/pwa.service';
import { Production } from 'src/app/interfaces/Production';
import { ProductionService } from 'src/app/services/data/production.service';
import { GoogleAnalytics } from 'src/app/decorators/ga';

interface PlotWithProductions extends Plot {
  productions: Production[];
}

@UntilDestroy()
@Component({
  selector: 'app-myplots',
  templateUrl: './myplots.page.html',
  styleUrls: ['./myplots.page.scss'],
})
export class MyplotsPage implements OnInit {

  plotsWithProductions$: Observable<PlotWithProductions[]>;

  user: User;

  skeletonItems = [0, 1, 2, 3, 4, 5, 6];

  // for the Google Map
  markers = [];
  width = '101%';
  zoom = 10;
  center = {
    lat: -22.3208730561416851,
    lng: -1.580959738168175
  };
  options = {
    //   mapTypeId: 'map',
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    //  maxZoom: 15,
    //  minZoom: 8,
  };
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;

  constructor(
    private modalCtrl: ModalController,
    private plotService: PlotService,
    private userService: UserService,
    private productionService: ProductionService,
  ) { this.user = this.userService.validate({}); }

  async ngOnInit() {
    // this we need to keep because of the updates in user that need to go to profilemenu
    this.userService.getUser$()
      .pipe(untilDestroyed(this), filter(user => user !== undefined))
      .subscribe(async user => {
        this.user = user;
        // logic to open welcome modal
        this.center = this.user.homeGPS;
      });

    const plots$ = this.plotService.getPlots$()
      .pipe(
        map(plots => plots.filter(plot => !plot.archived)),
        tap(plots => {
          if (plots.length === 1) {
            this.center = plots[0].GPS;
            this.zoom = 16;
            this.markers = [{
              clickable: true,
              position: plots[0].GPS,
              label: '', // plot.name,
              title: '', // plot.produce,
              plot: plots[0]
            }
            ];
          } else
            if (plots.length > 0) { // maybe the taps does the error on afterchangedetection etc.

              const bounds = new google.maps.LatLngBounds();
              const newMarkers = [];
              this.width = '101%';
              setTimeout(() => {
                this.width = '100%';
              }, 300);

              plots.forEach(plot => {
                newMarkers.push(
                  {
                    clickable: true,
                    position: plot.GPS,
                    label: '', // plot.name,
                    title: '', // plot.produce,
                    plot
                  });
              });

              this.markers = newMarkers;
              this.markers.forEach(marker => {
                bounds.extend(marker.position);
              });
              setTimeout(() => {
                this.map.fitBounds(bounds);
              }, 1000);
            }
        }));

    this.plotsWithProductions$ = this.productionService.getProductions$()
      .pipe(switchMap(productions => {
        return plots$
          .pipe(map(plots => {
            return plots.map(plot => {
              return {
                productions: productions.filter(production => (production.plotID === plot.plotID) && (!production.archived)),
                ...plot
              };
            });
          }));
      }));
  }

  @GoogleAnalytics('myplots')
  async ionViewDidEnter() {
  }


  mapClick(event) {
    // State House Kampala - 0.3208730561416851, 32.580959738168175
    // State House Entebbe - 0.059556, 32.468800
    //  console.log('mapClick Log', event.latLng.lat(), event.latLng.lng());
  }

  async viewPlot(plot: Plot) {
    const modal = await this.modalCtrl.create({
      component: ViewplotPage,
      componentProps: { plot, user: this.user }
    });
    await modal.present();
  }

  async addPlot() {
    const modal = await this.modalCtrl.create({
      component: NewplotwizardPage,
      componentProps: { user: this.user }
    });
    await modal.present();
  }

  @GoogleAnalytics('myplots')
  archivePlot(plot: Plot, slider: IonItemSliding) {
    if (slider) {
      slider.close();
    }
    this.plotService.markAsArchived(plot);
  }

  @GoogleAnalytics('myplots')
  async markerClick(marker) {
    console.log('Marker', marker);
    const { plot } = marker;

    const modal = await this.modalCtrl.create({
      component: ViewplotPage,
      componentProps: { plot, user: this.user }
    });
    await modal.present();
  }

}

