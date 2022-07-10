import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactPageRoutingModule } from './contact-routing.module';

import { ContactPage } from './contact.page';
import { ProfileitemModule } from 'src/app/components/profileitem/profileitem.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    //  ContactPageRoutingModule,
    // ProfileitemModule,
  ],
  declarations: [ContactPage]
})
export class ContactPageModule { }
