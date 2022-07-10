import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { InvitationPopoverPageRoutingModule } from './invitation-popover-routing.module';

import { InvitationModalPage } from './invitation-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // InvitationPopoverPageRoutingModule
  ],
  declarations: [InvitationModalPage]
})
export class InvitationModalPageModule { }
