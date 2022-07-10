import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewplotwizardPageRoutingModule } from './newplotwizard-routing.module';

import { NewplotwizardPage } from './newplotwizard.page';
import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    GoogleMapsModule,

  ],
  declarations: [NewplotwizardPage]
})
export class NewplotwizardPageModule { }
