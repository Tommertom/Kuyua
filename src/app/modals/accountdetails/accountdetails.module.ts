import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountdetailsPage } from './accountdetails.page';
import { ExperimentalPageModule } from '../experimental/experimental.module';

@NgModule({
  imports: [
    CommonModule,
    //   FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ExperimentalPageModule
  ],
  declarations: [AccountdetailsPage]
})
export class AccountdetailsPageModule { }
