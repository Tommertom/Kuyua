import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { GoogleMap } from '@angular/google-maps';

import { ModalController } from '@ionic/angular';
import { PlotService } from 'src/app/services/data/plot.service';

import { Plot } from 'src/app/interfaces/plot';
import { User } from 'src/app/interfaces/user';

import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { createIsNaNValidator } from 'src/app/validators/number.validator';

import { AngularFireAnalytics } from '@angular/fire/analytics';
import { GoogleAnalytics } from 'src/app/decorators/ga';

@Component({
  selector: 'app-newplotwizard',
  templateUrl: './newplotwizard.page.html',
  styleUrls: ['./newplotwizard.page.scss'],
})
export class NewplotwizardPage implements OnInit {

  @Input() user: User;

  newForm: FormGroup;

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;

  markers = [];
  zoom = 10;
  center = { lat: 0.3208730561416851, lng: 32.580959738168175 };
  options = {
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    //  maxZoom: 15,
    //  minZoom: 8,
  };
  width = '101%';

  constructor(
    private modalCtrl: ModalController,
    private plotService: PlotService,
    private fb: FormBuilder,
  ) { }


  @GoogleAnalytics('newplotwizard')
  ionViewDidEnter() {
    this.width = '101%';
    setTimeout(() => {
      this.width = '100%';
    }, 150);

  }

  ngOnInit() {
    this.newForm = this.fb.group({
      description: ['',
        Validators.compose(
          [Validators.required, Validators.min(5)]
        )],
      sizeInAcres: ['',
        Validators.compose(
          [Validators.required, , createIsNaNValidator()]
        )],
    });

    this.center = { ...this.user.homeGPS };
    this.markers = [{
      position: this.center,
      isMain: true,
    }];
  }

  cancelModal() {
    this.modalCtrl.dismiss();
  }


  @GoogleAnalytics('newplotwizard')
  addPlot() {
    const formValue = this.newForm.value;

    const newPlot: Plot = this.plotService.validate({
      ...this.newForm.value,
      userID: this.user.userID,
      GPS: this.center
    });

    this.plotService.upsert(newPlot);
    this.newForm.reset();

    this.modalCtrl.dismiss();
  }

  mapClick(event) {
    let myLocation;
    myLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };

    this.center = myLocation;
    this.markers = [{
      position: this.center,
      isMain: true,
    }];
    console.log('Mylocation', myLocation);
  }
}
