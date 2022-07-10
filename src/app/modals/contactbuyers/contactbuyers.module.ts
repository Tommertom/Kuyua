import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactbuyersPageRoutingModule } from './contactbuyers-routing.module';

import { ContactbuyersPage } from './contactbuyers.page';
import { ViewproductionPageModule } from '../viewproduction/viewproduction.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContactbuyersPageRoutingModule,
    ViewproductionPageModule
  ],
  declarations: [ContactbuyersPage]
})
export class ContactbuyersPageModule { }
