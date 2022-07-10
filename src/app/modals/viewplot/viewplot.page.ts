import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { GoogleMap } from '@angular/google-maps';

import { ModalController, PopoverController, IonItemSliding, AnimationController, AlertController } from '@ionic/angular';

import { Plot } from 'src/app/interfaces/plot';
import { Production } from 'src/app/interfaces/Production';

import { ProductionService } from 'src/app/services/data/production.service';

import { NewproductionwizardPage } from 'src/app/modals/newproductionwizard/newproductionwizard.page';
import { ViewproductionPage } from '../viewproduction/viewproduction.page';
import { SideModalService } from 'src/app/services/side-modal.service';
import { PlotService } from 'src/app/services/data/plot.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { createIsNaNValidator } from 'src/app/validators/number.validator';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { GoogleAnalytics } from 'src/app/decorators/ga';

@Component({
  selector: 'app-viewplot',
  templateUrl: './viewplot.page.html',
  styleUrls: ['./viewplot.page.scss'],
})
export class ViewplotPage implements OnInit {

  @Input() plot: Plot;
  productions$: Observable<Production[]>;
  oldProductions$: Observable<Production[]>;

  newForm: FormGroup;

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;

  markers = [];
  zoom = 10;
  center = { lat: 0.3208730561416851, lng: 32.580959738168175 };
  options = {
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    //  maxZoom: 15,
    //  minZoom: 8,
  };
  width = '101%';

  plotToggles: {
    [id: string]: {
      currToggle: boolean;
      production: Production;
    };
  } = {};

  constructor(
    private modalCtrl: ModalController,
    private productionService: ProductionService,
    private sideModalCtrl: SideModalService,
    private alertController: AlertController,
    private plotService: PlotService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.productions$ = this.productionService
      .getProductionsByPlotID(this.plot.plotID)
      .pipe(
        tap(productions => {
          productions.forEach(production => {
            this.plotToggles[production.productionID] = {
              currToggle: production.isForSale,
              production: this.productionService.clone(production)
            };
          });
        }),
        map(productions => productions.filter(production => !production.archived)));

    this.oldProductions$ = this.productionService
      .getProductionsByPlotID(this.plot.plotID)
      .pipe(map(productions => productions.filter(production => production.archived)));

    this.center = this.plot.GPS;
    this.markers = [{ position: this.center }];

    this.width = '101%';
    setTimeout(() => {
      this.width = '100%';
    }, 150);

    this.newForm =
      this.fb.group({
        description: ['',
          Validators.compose(
            [Validators.required, Validators.min(5)]
          )],
        sizeInAcres: ['',
          Validators.compose(
            [Validators.required, createIsNaNValidator()]
          )],
      });

    this.newForm.patchValue(this.plot);
  }


  @GoogleAnalytics('viewplot')
  ionViewDidEnter() {
  }

  cancelModal() {
    this.modalCtrl.dismiss();
  }

  async closeModal() {
    const newPlotData: Plot = this.plotService.validate({
      ...this.plot,
      ...this.newForm.value,
      GPS: this.center
    });

    this.plotService.upsert(newPlotData);

    this.syncToggleMap();

    this.modalCtrl.dismiss();
  }

  //

  async syncToggleMap() {
    //  Let's update based on toggle_map
    let upsertArray: Production[] = [];

    for (const key of Object.keys(this.plotToggles)) {
      if (this.plotToggles[key].currToggle !== this.plotToggles[key].production.isForSale) {
        this.plotToggles[key].production.isForSale = this.plotToggles[key].currToggle;
        upsertArray = [this.plotToggles[key].production, ...upsertArray];
        await this.productionService.syncPublishedOfProduction(this.plotToggles[key].production);
      }
    }

    if (upsertArray.length > 0) {
      // console.log('UPSERT changes', upsertArray);
      GoogleAnalytics('viewplot', 'updatingForSale');
      this.productionService.upsertArray(upsertArray);
    }
  }

  @GoogleAnalytics('viewplot')
  async addProduction() {
    // TODO: consider moving from PopOver to Nav navigation - https://ionicframework.com/blog/how-to-navigate-in-ionic-modals-with-ion-nav/
    const modal = await this.sideModalCtrl.create({
      component: NewproductionwizardPage,
      //  cssClass: 'big-popover',
      //  event: ev,
      componentProps: { plot: this.plot },
      translucent: true,
      backdropDismiss: false
    });
    return await modal.present();
  }

  @GoogleAnalytics('viewplot')
  archiveProduction(production: Production, slider: IonItemSliding) {
    if (slider) {
      slider.close();
    }

    this.productionService.markAsArchived(production);
  }

  async viewProduction(production: Production) {

    this.syncToggleMap();

    const productionToView = this.productionService.clone(production) as Production;
    if (this.plotToggles[production.productionID] !== undefined) {
      productionToView.isForSale = this.plotToggles[production.productionID].currToggle;
    }
    const modal = await this.sideModalCtrl.create({
      component: ViewproductionPage,
      componentProps: { production: productionToView } //
    });
    await modal.present();

  }

  @GoogleAnalytics('viewplot')
  async mapClick(event) {
    // State House Kampala - 0.3208730561416851, 32.580959738168175
    // State House Entebbe - 0.059556, 32.468800
    // console.log('Log', event, event.latLng.lat(), event.latLng.lng());

    const alert = await this.alertController.create({
      //  cssClass: 'my-custom-class',
      header: 'Alert',
      //  subHeader: 'Subtitle',
      message: 'Do you want to change the location of this plot?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Okay',
          handler: () => {
            const newGPS = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            };
            //  console.log('Confirm Okay', newGPS);
            this.center = newGPS;
            this.markers = [{ position: this.center }];
            this.plotService.updateGPS(this.plot, newGPS)
          }
        }
      ]
    });

    await alert.present();
  }

  @GoogleAnalytics('viewplot')
  toggleForSale(production: Production) {
    // this.GA.logEvent('kuyua_viewproduction', {});

    //  console.log('Toggling', production);

    // this.productionService.toggleForSale(production);
    this.plotToggles[production.productionID].currToggle = !this.plotToggles[production.productionID].currToggle;

    //  this.syncToggleMap();

  }

}
