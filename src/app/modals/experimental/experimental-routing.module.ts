import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExperimentalPage } from './experimental.page';

const routes: Routes = [
  {
    path: '',
    component: ExperimentalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExperimentalPageRoutingModule {}
