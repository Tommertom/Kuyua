import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SplashActivateGuard implements CanActivate {

  constructor(
    private router: Router,
    private platform: Platform
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const lastEmail = window.localStorage.getItem('kuyuaLastEmail');
    const validateEmail = (email) => {
      // eslint-disable-next-line max-len
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    };

    const navPath = validateEmail(lastEmail) ? '/login' : '/signup';
    const signuploginPage: UrlTree = this.router.parseUrl(navPath);

    console.log('SplashActivateGuard', this.platform.is('pwa' || 'cordova' || 'capacitor'));

    if (environment.production) {
      return this.platform.is('pwa' || 'cordova' || 'capacitor') ? true : signuploginPage;
    } else {
      return true;
    }
  }
}
