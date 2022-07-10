import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewplotPage } from './viewplot.page';

const routes: Routes = [
  {
    path: '',
    component: ViewplotPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewplotPageRoutingModule {}
