import { Component, OnInit } from '@angular/core';

import { UserService } from 'src/app/services/data/user.service';

import { User } from 'src/app/interfaces/user';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ModalController } from '@ionic/angular';
import { GoogleAnalytics } from 'src/app/decorators/ga';

@UntilDestroy()
@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  user: User;

  constructor(
    private userService: UserService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.userService.getUser$()
      .pipe(untilDestroyed(this))
      .subscribe(user => { this.user = user; });
  }

  @GoogleAnalytics('contact')
  ionViewDidEnter() {
  }

  closeModal() {
    this.modalController.dismiss();
  }
}

