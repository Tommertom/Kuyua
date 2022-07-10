import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'marketplace',
        loadChildren: () => import('../marketplace/marketplace.module').then(m => m.MarketplacePageModule),
        // data: { preload: true }
      },
      {
        path: 'myplots',
        loadChildren: () => import('../myplots/myplots.module').then(m => m.MyplotsPageModule),
        // data: { preload: true }
      },
      {
        path: 'myplots/:extra',
        loadChildren: () => import('../myplots/myplots.module').then(m => m.MyplotsPageModule),
        // data: { preload: true }
      },
      {
        path: 'mysales',
        loadChildren: () => import('../mysales/mysales.module').then(m => m.MysalesPageModule),
        // data: { preload: true }
      },
      {
        path: '',
        redirectTo: '/tabs/marketplace',
        pathMatch: 'full'
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule { }
