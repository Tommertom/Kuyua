import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyplotsPage } from './myplots.page';

const routes: Routes = [
  {
    path: '',
    component: MyplotsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyplotsPageRoutingModule {}
