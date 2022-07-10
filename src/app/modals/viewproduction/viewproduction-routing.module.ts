import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewproductionPage } from './viewproduction.page';

const routes: Routes = [
  {
    path: '',
    component: ViewproductionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewproductionPageRoutingModule {}
