import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewproductionwizardPage } from './newproductionwizard.page';

const routes: Routes = [
  {
    path: '',
    component: NewproductionwizardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewproductionwizardPageRoutingModule {}
