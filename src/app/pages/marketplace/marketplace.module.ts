import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarketplacePageRoutingModule } from './marketplace-routing.module';

import { MarketplacePage } from './marketplace.page';
import { ContactbuyersPageModule } from 'src/app/modals/contactbuyers/contactbuyers.module';
import { ContactsellersPageModule } from 'src/app/modals/contactsellers/contactsellers.module';
import { ViewplotPageModule } from 'src/app/modals/viewplot/viewplot.module';
import { ProfileitemModule } from 'src/app/components/profileitem/profileitem.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarketplacePageRoutingModule,

    ContactbuyersPageModule,
    ContactsellersPageModule,
    ViewplotPageModule,

    ProfileitemModule,
  ],
  declarations: [MarketplacePage]
})
export class MarketplacePageModule { }
