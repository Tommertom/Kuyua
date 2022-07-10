import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactsellersPageRoutingModule } from './contactsellers-routing.module';

import { ContactsellersPage } from './contactsellers.page';
import { SimplelistviewerComponentModule } from 'src/app/components/simplelistviewer/simplelistviewer.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ContactsellersPageRoutingModule,
    SimplelistviewerComponentModule
  ],
  declarations: [ContactsellersPage]
})
export class ContactsellersPageModule { }
