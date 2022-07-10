import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactsellersPage } from './contactsellers.page';

const routes: Routes = [
  {
    path: '',
    component: ContactsellersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactsellersPageRoutingModule {}
