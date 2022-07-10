import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewproductionwizardPageRoutingModule } from './newproductionwizard-routing.module';

import { NewproductionwizardPage } from './newproductionwizard.page';

// import { MatStepperModule } from '@angular/material/stepper';

@NgModule({

  imports: [
    CommonModule,
    ReactiveFormsModule,
    //  FormsModule,
    IonicModule,
    NewproductionwizardPageRoutingModule,
  ],
  declarations: [NewproductionwizardPage]
})
export class NewproductionwizardPageModule { }

