import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactbuyersPage } from './contactbuyers.page';

const routes: Routes = [
  {
    path: '',
    component: ContactbuyersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactbuyersPageRoutingModule {}
