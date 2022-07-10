import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { ViewproductionPage } from './viewproduction.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    //  ViewproductionPageRoutingModule,
  ],
  declarations: [ViewproductionPage]
})
export class ViewproductionPageModule { }
