import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WelcomewizardPage } from './welcomewizard.page';

import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GoogleMapsModule
  ],
  declarations: [WelcomewizardPage]
})
export class WelcomewizardPageModule { }
