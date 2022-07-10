import { NgModule } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { ProfileitemComponent, ProfileMenu } from 'src/app/components/profileitem/profileitem.component';
import { AccountdetailsPageModule } from 'src/app/modals/accountdetails/accountdetails.module';
import { ContactPageModule } from 'src/app/modals/contact/contact.module';

@NgModule({
  entryComponents: [
    ProfileitemComponent, ProfileMenu
  ],
  imports: [
    ContactPageModule,
    IonicModule,
    CommonModule,
    AccountdetailsPageModule,
  ],
  declarations: [
    ProfileitemComponent, ProfileMenu
  ],
  exports: [
    ProfileitemComponent
  ],
})
export class ProfileitemModule { }
