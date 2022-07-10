import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewplotPageRoutingModule } from './viewplot-routing.module';

import { ViewplotPage } from './viewplot.page';

import { NewproductionwizardPageModule } from 'src/app/modals/newproductionwizard/newproductionwizard.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { ViewproductionPageModule } from '../viewproduction/viewproduction.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    GoogleMapsModule,
    ViewproductionPageModule,
    NewproductionwizardPageModule,
  ],
  declarations: [ViewplotPage]
})
export class ViewplotPageModule { }
