import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountdetailsPage } from './accountdetails.page';

const routes: Routes = [
  {
    path: '',
    component: AccountdetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountdetailsPageRoutingModule { }
