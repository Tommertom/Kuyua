import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';

import { Router } from '@angular/router';

import { PopoverController, ModalController, LoadingController } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { User } from 'src/app/interfaces/user';
import { AccountdetailsPage } from 'src/app/modals/accountdetails/accountdetails.page';
import { ContactPage } from 'src/app/modals/contact/contact.page';
import { UserService } from 'src/app/services/data/user.service';


import { FirebaseService } from 'src/app/services/firebase.service';

// The MENU
@Component({
  selector: 'app-profilemenu',
  templateUrl: './profilemenu.component.html',
  styleUrls: ['./profilemenu.component.scss'],
})
// tslint:disable-next-line: component-class-suffix
export class ProfileMenu implements OnInit {
  @Input() user: User;

  stuff$: Observable<string>;

  constructor(
    private modalController: ModalController,
    private modalCtrl: ModalController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private firebase: FirebaseService,
    private popoverCtrl: PopoverController,
    private userService: UserService,
  ) { }

  ngOnInit() {
    console.log('Getting user in menu', this.user);
  }

  async showSettings() {
    this.dismiss();
    const modal = await this.modalCtrl.create({
      component: AccountdetailsPage,
      componentProps: { user: this.user }
    });
    return await modal.present();
  }

  async doPubSub() {
    this.dismiss();
  }

  async doSync() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 10000
    });
    await loading.present();

    this.dismiss();
  }

  async aboutKuyua() {
    this.dismiss();
    const popover = await this.modalController.create({
      component: ContactPage,
      cssClass: 'my-custom-class',
      //  event: ev,
      //  translucent: true
    });
    await popover.present();
  }

  async signOut() {

    this.dismiss();
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 15000
    });
    await loading.present();

    await this.userService.setUserProperty({ prop: 'lastLogout', value: Date.now() });
    this.firebase.signOut(); // tricky!!

    this.router.navigateByUrl('/login');

    if (loading) {
      loading.dismiss();
    }
  }

  dismiss() {
    this.popoverCtrl.dismiss();
  }
}

// The AVATAR
@UntilDestroy()
@Component({
  selector: 'app-profileitem',
  templateUrl: './profileitem.component.html',
  styleUrls: ['./profileitem.component.scss'],
})
export class ProfileitemComponent implements OnInit {

  @Input() user: User;

  stuff$: any;

  constructor(
    private popoverCtrl: PopoverController,
    private userService: UserService,
    private changeDetector: ChangeDetectorRef,
  ) {

    this.user = this.userService.validate({});

  }

  ngOnInit() {

    // TODO - avatar does not update

    this.stuff$ = this.userService.getUser$()
      .pipe(
        untilDestroyed(this),
        filter(user => user !== undefined),
        map(user => user.photoURL)
      );

    /*
    this.userService.getUser$()
      .pipe(
        untilDestroyed(this),
        filter(user => user !== undefined))
      .subscribe(user => {
        //  console.log('KUTTTT', user.photoURL);
        this.user = user;
        this.changeDetector.detectChanges();
      });
 */

  }

  async presentPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: ProfileMenu,
      event: ev,
      translucent: true,
      componentProps: { user: this.user }
    });
    return await popover.present();
  }
}
