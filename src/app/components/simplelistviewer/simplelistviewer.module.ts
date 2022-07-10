import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SimplelistviewerPage } from './simplelistviewer.page';

@NgModule({
  entryComponents: [
    SimplelistviewerPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  exports: [SimplelistviewerPage],
  declarations: [SimplelistviewerPage]
})
export class SimplelistviewerComponentModule { }
