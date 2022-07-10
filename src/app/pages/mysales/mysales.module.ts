import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MysalesPageRoutingModule } from './mysales-routing.module';

import { MysalesPage } from './mysales.page';
import { ContactbuyersPageModule } from 'src/app/modals/contactbuyers/contactbuyers.module';
import { ProfileitemModule } from 'src/app/components/profileitem/profileitem.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MysalesPageRoutingModule,
    ProfileitemModule,
    // ContactbuyersPageModule,
  ],
  declarations: [MysalesPage]
})
export class MysalesPageModule { }
