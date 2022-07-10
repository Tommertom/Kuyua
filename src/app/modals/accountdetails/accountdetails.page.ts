import { Component, OnInit, Input, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';

import { User } from 'src/app/interfaces/user';

import { BuyingOpportunityService } from 'src/app/services/data/buyingopportunity.service';
import { ProductionService } from 'src/app/services/data/production.service';
import { UserService } from 'src/app/services/data/user.service';
import { FirebaseService } from 'src/app/services/firebase.service';

import { InAppMessagesService } from 'src/app/services/in-app-messages.service';

import { Share } from '@capacitor/share';

import * as firebase from 'firebase/app';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PwaService } from 'src/app/services/pwa.service';
import { AngularFireAnalytics } from '@angular/fire/analytics';

import { resizeFile } from 'src/app/utils/helpers';
import { AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { map, last, switchMap } from 'rxjs/operators';

import { Clipboard } from '@capacitor/clipboard';

import { GoogleAnalytics } from 'src/app/decorators/ga';
import { ExperimentalPage } from '../experimental/experimental.page';

@UntilDestroy()
@Component({
  selector: 'app-accountdetails',
  templateUrl: './accountdetails.page.html',
  styleUrls: ['./accountdetails.page.scss'],
})
export class AccountdetailsPage implements OnInit {

  recaptchaVerifier: firebase.default.auth.RecaptchaVerifier = undefined;
  confirmationResult: firebase.default.auth.ConfirmationResult = undefined;

  @Input() user: User;

  newForm: FormGroup;

  showDelete = false;

  photoURL = '';

  loading: HTMLIonLoadingElement;

  phoneChanged = false;

  showConfirmbutton = false;
  disableSendSMS = false;
  showNotificationButton = false;

  showExperimental = false;

  constructor(
    private modalCtrl: ModalController,
    private userService: UserService,
    private alertCtrl: AlertController,
    private firebaseService: FirebaseService,
    private loadingCtrl: LoadingController,
    private fb: FormBuilder,
    private productionService: ProductionService,
    private buyingOpportunityService: BuyingOpportunityService,
    private inAppMessage: InAppMessagesService,
    private pwaService: PwaService,
    private changeDetector: ChangeDetectorRef,
    private platformService: Platform,
  ) { }

  ngOnInit() {
    console.log('Received user', this.user);

    //  this.photoURL = this.user.photoURL;

    this.newForm =
      this.fb.group({
        verifierCode: ['',
          Validators.compose(
            []
          )],
        mobileVerified: ['',
          Validators.compose(
            []
          )],
        fullName: ['',
          Validators.compose(
            [Validators.required]
          )],
        email: ['',
          Validators.compose(
            [Validators.required]
          )],
        whatsAppNr: ['',
          Validators.compose(
            []
          )]
      });

    this.showDelete = ['NAqp4jYyczdTSvi6PzMm81CFV272', 'xg7vvJ7H9efeYMrLGNg1AJNTjlG3',
      'UCtMLf5FB6XYrIrrWwsitLI0GMB3', 'jJ1euSp3zEOuhToJNrzMsNZWPw92', 'Tfyve9y0MsUP2FAcunSZYZo3Mk73'].includes(this.user.userID);

    this.newForm.patchValue(this.user);

    if (!this.user.mobileVerified) {
      this.showConfirmbutton = true;
    }
  }

  @GoogleAnalytics('accountdetails')
  ionViewDidEnter() {

    this.photoURL = this.user.photoURL;

    this.showExperimental = this.userService.userIsAdmin();

    if (!this.platformService.is('ios') && !navigator.platform.includes('Mac')) {
      this.showNotificationButton = !this.pwaService.instanceHasNotifications();
    }

    this.pwaService.checkAppUpdate();

    if (!this.user.mobileVerified) {
      this.showConfirmbutton = true;

      /*
      this.recaptchaVerifier = new firebase.default.auth.RecaptchaVerifier('send-confirm-button', {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log('SINGUP submit phone', response);
          this.showConfirmbutton = false;
        }
      });
      */
    } else {
      this.recaptchaVerifier = undefined;
      this.showConfirmbutton = false;
    }

    this.newForm.controls.whatsAppNr.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(vs => {
        this.phoneChanged = vs !== this.user.whatsAppNr;
        //  this.showConfirmbutton = this.phoneChanged;
        //  console.log('Whatsapp nr value changes', vs, this.phoneChanged, this.user.whatsAppNr);
      });
  }

  async closeAndSave() {

    const submitChanges = () => {

      const newUserData = this.userService.validate({
        ...this.user,
        ...this.newForm.value,
      });
      this.userService.upsert(newUserData);

      // geef nieuwe gebruiker door aan production service zodat de nieuwe gegevens worden emegegeven, want userService is niet op tijd
      // interest that is created when selected)
      if (this.newForm.dirty) {
        this.buyingOpportunityService.republishBuyingInterests(newUserData);
        this.productionService.republishProductionsForSale(newUserData);
      }
      this.modalCtrl.dismiss();
    };

    if (this.phoneChanged) {
      this.newForm.controls.mobileVerified.setValue(false);
      const alert = await this.alertCtrl.create({
        // cssClass: 'my-custom-class',
        header: 'Phone number changed',
        message: 'Your phone number has changed and is not validated. Do you want to validate or continue with limited features?',
        buttons: [
          {
            text: 'Go back and validate',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              this.showConfirmbutton = true;
            }
          }, {
            text: 'Do not validate yet',
            handler: () => {
              this.newForm.controls.mobileVerified.setValue(false);
              submitChanges();
            }
          }
        ]
      });
      await alert.present();
    } else {
      submitChanges();
    }
  }

  async closeModal() {
    this.modalCtrl.dismiss();
  }

  async setupNotifications() {
    this.pwaService.initNotifications();
    const result = await this.pwaService.initNotifications();
    this.showNotificationButton = !result;
    if (!result) {
      this.inAppMessage.presentToast('Not able to activate notifications. Select yes and/or remove setting in your browser.');
    }
  }
  /*
 <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
    <br>
    <ion-button expand="full" color="danger" (click)="deleteAccount()">Delete account</ion-button>


  */

  // The user's phone number in E.164 format (e.g. +16505550101).
  async sendConfirmationCode() {

    if (this.recaptchaVerifier && ('clear' in this.recaptchaVerifier)) {
      this.recaptchaVerifier.clear();
    }

    this.recaptchaVerifier = new firebase.default.auth.RecaptchaVerifier('send-confirm-button', {
      size: 'invisible',
      callback: (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log('SINGUP submit phone', response);
        this.showConfirmbutton = false;
      }
    });

    this.loading = await this.loadingCtrl.create({
      message: 'Please check SMS on your phone',
      duration: 3000,
    });
    this.loading.present();

    this.disableSendSMS = true;
    setTimeout(() => {
      this.disableSendSMS = false;
    }, 2000);

    const user = await this.firebaseService.getAuthObject().currentUser;
    try {
      await user.unlink('phone');
    } catch (err) {
      console.log('Not linked, but we do not care');
    }

    user.linkWithPhoneNumber(this.newForm.controls.whatsAppNr.value, this.recaptchaVerifier)
      // this.firebaseService.getAuthObject().signInWithPhoneNumber(this.newForm.controls.whatsAppNr.value, this.recaptchaVerifier)
      .then((confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        console.log(confirmationResult);
        this.confirmationResult = confirmationResult;
        // TODO: finally firing too late??
        this.showConfirmbutton = false;
        this.changeDetector.detectChanges();
        if (this.loading) {
          this.loading.dismiss();
        }
      })
      .catch((error) => {
        // Error; SMS not sent
        // ...
        if (this.loading) {
          this.loading.dismiss();
        }
        this.showConfirmbutton = true;
        console.log('error', error);
        // auth/invalid-phone-number
        // auth/credential-already-in-use
        // auth/too-many-requests
        this.inAppMessage.presentToast('Something went wrong sending SMS' + error);
      });
  }

  confirmSMSCode() {
    this.showConfirmbutton = true;
    const confCode = this.newForm.controls.verifierCode.value;
    if (confCode.length === 6) {
      this.confirmationResult.confirm(confCode)
        .then(async res => {
          this.inAppMessage.presentAlert('Phone number validated.<br> Thank you!');
          const user = await this.firebaseService.getAuthObject().currentUser;
          console.log('conf result', res, user);
          this.userService.setUserProperty({ prop: 'mobileVerified', value: true });
          this.newForm.controls.mobileVerified.setValue(true);
          this.confirmationResult = undefined;
          this.phoneChanged = false;
        })
        .catch(error => {
          this.inAppMessage.presentToast('Invalide code provided.' + error);
          this.confirmationResult = undefined;
        });
    } else {
      this.inAppMessage.presentToast('Invalide code provided.');
    }
  }


  async deleteAccount() {

    const alert = await this.alertCtrl.create({
      //  cssClass: 'my-custom-class',
      header: 'Confirm!',
      message: 'You are sure you want to delete your account - this will be irreversible!!!',
      inputs: [
        {
          name: 'yes',
          type: 'text',
          placeholder: 'Type YES'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data: { yes: string }) => {
            console.log('Confirm Ok', data);
            if (data.yes.toLowerCase() === 'yes') {
              this.userTypedYes();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // @Log()
  async userTypedYes() {

    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 14000,
    });
    loading.present();
  }

  async copyInviteCode(inviteCode: string) {

    const url = 'https://kuyua.farm/signuplogin/' + inviteCode;

    Clipboard.write({
      string: url
    });

    this.inAppMessage.presentToast('Copied to clipboard!');

    const shareRet = await Share.share({
      title: 'See cool stuff',
      text: `Signup to Kuyua using this exclusive code:${inviteCode}\n\n Really cool stuff!! 🚀🚀🚀\n\n`,
      url,
      dialogTitle: 'Share with your buddies'
    });
  }

  cancelConfirmSMSCode() {
    this.showConfirmbutton = true;
  }


  // https://codepen.io/antony-manuel/pen/xMdrVE - avatar upload html and css
  // https://codesandbox.io/s/avatar-input-component-with-vuejs-and-tailwindcss-jpg80
  @GoogleAnalytics('accountdetails')
  async upload(event) {
    console.log('Uploading', event.target.files);

    if (event.target.files.length !== 1) {
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Uploading',
      duration: 20 * 1000,
    });
    loading.present();

    const file = event.target.files[0];
    resizeFile(file, {
      width: 250,
      height: 250
    }, async (blobRes, isOk) => {
      console.log('RESIZE result', blobRes, isOk);
      if (!isOk) {
        console.log('Resizing failed');
        // TODO: fail message
        if (loading) {
          loading.dismiss();
        }
        return;
      }

      let ref: AngularFireStorageReference;
      let task: AngularFireUploadTask;

      const user = await this.firebaseService.getAuthObject().currentUser;
      ref = this.firebaseService.storage().ref('/images/' + user.uid + '/photoURL.jpg');
      task = ref.put(blobRes);
      task.snapshotChanges().pipe(
        last(),
        switchMap(() => ref.getDownloadURL())
      ).subscribe(url => {
        console.log('download url:', url);
        if (loading) {
          loading.dismiss();
        }

        this.photoURL = url;
        this.userService.setUserProperty({ prop: 'photoURL', value: url });

        // To see if avatar really changed after update - or some other function triggering update
        //  const newUser: User = this.userService.clone(this.user);
        //   newUser.photoURL = url;
        //  this.productionService.republishProductionsForSale(newUser);
      },
        (error) => {
          console.log('Error uploading file', error);
        }
      );
    });
  }

  async showExperimentalFeatures() {

    this.modalCtrl.dismiss();

    const modal = await this.modalCtrl.create({
      component: ExperimentalPage,
      componentProps: {}
    });
    await modal.present();
  }
}


/*
 <br>
    <ion-avatar style="margin:0 auto;width:120px;height:120px">
        <img [src]="user?.photoURL">
    </ion-avatar>



        <ng-container *ngIf="!newForm.controls.mobileVerified.value">
            <h2>Your mobile number is not verified</h2>
            <ion-button *ngIf="showConfirmbutton" (click)="sendConfirmationCode()" id="send-confirm-button">Send confirmation code
            </ion-button>
            <ng-container *ngIf="!showConfirmbutton">
                <ion-item>
                    <ion-label position="stacked">Enter confirmation code received from SMS</ion-label>
                    <ion-input placeholder="Enter value" formControlName="verifierCode"></ion-input>
                </ion-item>
                <ion-button (click)="cancelConfirmSMSCode()">Cancel</ion-button>
                <ion-button (click)="confirmSMSCode()">Check code</ion-button>
            </ng-container>
        </ng-container>

    <h2>Invite your friends to Kuyua</h2>
    Use the invite codes and links to invite your friends to Kuyua!
    Codes can be used multiple times. Click on the code to copy to clipboard and share!
    <ion-item *ngFor="let code of user.invitationCodes" (click)="copyInviteCode(code)">
        Invite code:
        <pre>{{code}}</pre>
    </ion-item>
*/
