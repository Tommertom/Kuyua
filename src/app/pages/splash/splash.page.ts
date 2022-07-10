import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleAnalytics } from 'src/app/decorators/ga';

import { UserService } from 'src/app/services/data/user.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {

  constructor(
    private router: Router,
  ) { }

  async ngOnInit() {

    let navPath = '/signup';

    const lastEmail = window.localStorage.getItem('kuyuaLastEmail');
    // const lastMobile = window.localStorage.getItem('kuyuaLastMobile');

    console.log('Splash - last email', lastEmail);

    if (lastEmail) {
      navPath = '/login/' + lastEmail;
      GoogleAnalytics('splash', 'login')();
    } else {
      GoogleAnalytics('splash', 'signup')();
    }

    setTimeout(() => {
      this.router.navigateByUrl(navPath);
    }, 2000);
  }

}
