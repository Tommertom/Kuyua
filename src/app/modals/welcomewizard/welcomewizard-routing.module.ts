import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WelcomewizardPage } from './welcomewizard.page';

const routes: Routes = [
  {
    path: '',
    component: WelcomewizardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WelcomewizardPageRoutingModule {}
