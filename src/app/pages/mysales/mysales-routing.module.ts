import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MysalesPage } from './mysales.page';

const routes: Routes = [
  {
    path: '',
    component: MysalesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MysalesPageRoutingModule {}
