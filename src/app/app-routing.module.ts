import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SplashActivateGuard } from './guards/splash-activate.guard';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';

const routes: Routes = [
  {
    path: 'splash',
    loadChildren: () => import('./pages/splash/splash.module').then(m => m.SplashPageModule),
    canActivate: [SplashActivateGuard]
  },
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AngularFireAuthGuard],
    // data: { preload: true }
  },
  // { path: 'prelaunch', redirectTo: '/signuplogin/prelaunch', pathMatch: 'full' },

  {
    path: 'signup',
    loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignupPageModule)
  },
  {
    path: 'signup/:command/:payload',
    loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignupPageModule)
  },
  {
    path: 'go/:gocode',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'login/:email',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'login/:command/:payload',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'login/:email/:command/:payload',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: '**',
    loadChildren: () => import('./pages/splash/splash.module').then(m => m.SplashPageModule),
    canActivate: [SplashActivateGuard]
  },
  {
    path: 'experimental',
    loadChildren: () => import('./modals/experimental/experimental.module').then( m => m.ExperimentalPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
