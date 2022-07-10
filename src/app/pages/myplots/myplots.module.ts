import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyplotsPageRoutingModule } from './myplots-routing.module';

import { MyplotsPage } from './myplots.page';

import { NewplotwizardPageModule } from 'src/app/modals/newplotwizard/newplotwizard.module';
import { WelcomewizardPageModule } from 'src/app/modals/welcomewizard/welcomewizard.module';
import { ProfileitemModule } from 'src/app/components/profileitem/profileitem.module';
import { GoogleMapsModule } from '@angular/google-maps';


@NgModule({

  imports: [
    CommonModule,
    FormsModule,

    // ReactiveFormsModule,
    IonicModule,
    MyplotsPageRoutingModule,

    GoogleMapsModule,

    ProfileitemModule,
    WelcomewizardPageModule,
    NewplotwizardPageModule,
  ],
  declarations: [MyplotsPage,]
})
export class MyplotsPageModule { }
