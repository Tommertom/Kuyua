import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LoadingController, AlertController, Platform, ToastController, PopoverController, ModalController, IonContent } from '@ionic/angular';


import { UntilDestroy } from '@ngneat/until-destroy';

import { UserService } from 'src/app/services/data/user.service';
import { FirebaseService } from 'src/app/services/firebase.service';

import { PwaService } from 'src/app/services/pwa.service';
import { InAppMessagesService } from 'src/app/services/in-app-messages.service';

import { User } from 'src/app/interfaces/user';
import { HttpClient } from '@angular/common/http';

const cookieOkPath = '_____cookieConsent______'; // local storag
import { take, timeout } from 'rxjs/operators';

import * as firebase from 'firebase/app';
import { CountryService } from 'src/app/services/data/country.service';
import { GoogleAnalytics } from 'src/app/decorators/ga';

@UntilDestroy()
@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  @ViewChild('content', { static: true }) content: IonContent;

  recaptchaVerifier: firebase.default.auth.RecaptchaVerifier = undefined;
  confirmationResult: firebase.default.auth.ConfirmationResult = undefined;

  user: User;

  loading: HTMLIonLoadingElement;

  version = '0';
  log = '';
  viewLog = false;

  phoneNumber = '';
  fullName = '';
  verifierCode = '';

  phoneChanged = false;

  showConfirmbutton = true;
  disableSendSMS = false;

  command = '';
  payload = '';

  // foundLastMobile = false;
  hasEnteredData = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private firebaseService: FirebaseService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private pwaService: PwaService,
    private inAppMessage: InAppMessagesService,
    private toastController: ToastController,
    private http: HttpClient,
    private changeDetector: ChangeDetectorRef,
    private countryService: CountryService,
    private route: ActivatedRoute,
  ) {
    this.user = this.userService.validate({}); // to avoid template errors

    this.http.get('assets/json/time.txt', { responseType: 'text' }).subscribe(data => {
      console.log('Version', data);
      this.version = data;
    });
  }


  // we need to handle Firebase login Redirect-method via OnInit and the onAuthStateChange handler
  async ngOnInit() {
    this.command = this.route.snapshot.paramMap.get('command');
    this.payload = this.route.snapshot.paramMap.get('payload');
    this.processCommands();

    //    console.log('sdasdsa', navigator.connection.effectiveType, navigator.connection.type);

  }

  showPincode(code) {
    console.log('Show code', code);
  }

  setRecaptcha() {
    if (this.recaptchaVerifier && ('clear' in this.recaptchaVerifier)) {
      console.log('Clearing recaptcha');
      this.recaptchaVerifier.clear();
      document.getElementById('recaptcha-container').innerHTML = '<div id=\'send-confirm-button\'></div>';
    }

    this.recaptchaVerifier = new firebase.default.auth.RecaptchaVerifier('send-confirm-button', {
      size: 'invisible',
      callback: (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log('SINGUP submit phone', response);
        this.showConfirmbutton = false;
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        // ...
      }
    });
  }

  // we need to determine if the user was already here, everytime we get this window - so not only in OnInit
  @GoogleAnalytics('signup')
  async ionViewWillEnter() {

    //  const lastMobile = window.localStorage.getItem('kuyuaLastMobile');
    // this.foundLastMobile = false; // lastMobile !== null;

    //  if (this.foundLastMobile) {
    //   this.phoneNumber = lastMobile;
    // }

    this.hasEnteredData = false;

    this.setRecaptcha();

    setTimeout(async () => {
      const val = window.localStorage.getItem(cookieOkPath);
      if (val === null) {
        await this.presentCookieConsent();
      }
      this.pwaService.checkAppUpdate();
    }, 4000);

  }

  // @GoogleAnalytics('signup')
  async presentAreYouSure() {

    let isValidCountry = false; //     ['+31', '+256', '+254', '+255'].
    //  console.log('CRAP', this.countryService.getCountryPhoneCodes());
    this.countryService.getCountryPhoneCodes().forEach(phoneCode => {
      if (this.phoneNumber.includes(phoneCode)) {
        isValidCountry = true;
        GoogleAnalytics('signup', 'phoneCode' + phoneCode)();
      }
    });

    if (!isValidCountry) {
      GoogleAnalytics('signup', 'invalid_phone_code_' + this.phoneNumber)();
      this.inAppMessage.presentAlert('Sorry, but only mobile numbers from Uganda, Kenya and Tanzania are allowed. Drop us a mail if you want us to go to your country!');
      return;
    }

    this.loading = await this.loadingCtrl.create({
      message: 'SMS is being sent to you phone. Please wait about 10 seconds and enter code here',
      duration: 10000,
    });
    this.loading.present();

    // hack to see if this ensures showing loading controller
    setTimeout(() => {
      this.sendConfirmationCode();
    }, 200);

    const alert = await this.alertCtrl.create({
      // cssClass: 'my-custom-class',
      backdropDismiss: false,
      header: 'Terms and Conditions',
      message: 'By signing up to Kuyua you agree to the Terms and Conditions. Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            GoogleAnalytics('signup', 'cancel_tos')();
          }
        }, {
          text: 'Okay',
          role: 'Okay',
          handler: () => {
            this.sendConfirmationCode();
          }
        }
      ]
    });
    //  await alert.present();

    //    const { role } = await alert.onDidDismiss();
    //   console.log('onDidDismiss resolved with role', role);
  }

  userEntersData() {
    // console.log('CRAP1');
    if (!this.hasEnteredData) {
      //   console.log('CRAP2');
      this.hasEnteredData = true;
      GoogleAnalytics('signup', 'entered_data')();
    }
  }

  @GoogleAnalytics('signup')
  goToLogin() {
    this.router.navigateByUrl('/login');
  }

  @GoogleAnalytics('signup')
  async sendConfirmationCode() {

    this.phoneNumber = this.phoneNumber.replace(/ /g, '');

    console.log('The recaptcha', this.recaptchaVerifier, 'clear' in this.recaptchaVerifier);

    this.disableSendSMS = true;
    this.showConfirmbutton = false;

    this.firebaseService.getAuthObject().signInWithPhoneNumber(this.phoneNumber, this.recaptchaVerifier)
      // this.firebaseService.getAuthObject().signInWithPhoneNumber(this.newForm.controls.whatsAppNr.value, this.recaptchaVerifier)
      .then((confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the
        this.confirmationResult = confirmationResult;
        this.showConfirmbutton = false;
        this.disableSendSMS = false;
        this.changeDetector.detectChanges();
        if (this.loading) {
          this.loading.dismiss(); // can be too early because the sms has not arrived yet
        }
      })
      .catch((error) => {
        // Error; SMS not sent
        // ...
        if (this.loading) {
          this.loading.dismiss();
        }
        this.showConfirmbutton = true;
        this.disableSendSMS = true;
        console.log('error', error);

        const errorMapping = {
          'auth/invalid-phone-number': ' wrong number provided',
          'auth/credential-already-in-use': ' number already in use',
          'auth/too-many-requests': ' too busy, try again later',
        };

        let message = errorMapping[error.code];
        if (message === undefined) {
          message = 'unknown issue, try again later';
        }

        // error.code
        // auth/invalid-phone-number
        // auth/credential-already-in-use
        // auth/too-many-requests
        this.inAppMessage.presentToast('Something went wrong sending SMS - ' + message);
      });
  }


  // https://stackoverflow.com/questions/52647092/firebase-phoneauth-linkwithphonenumber-how-to-change-a-users-linked-phone
  @GoogleAnalytics('signup')
  async confirmSMSCode() {

    this.loading = await this.loadingCtrl.create({
      message: 'Please wait while we confirm...',
      duration: 5000,
    });
    await this.loading.present();

    this.showConfirmbutton = true;
    const confCode = this.verifierCode;
    if (confCode.length === 6) {
      this.confirmationResult.confirm(confCode)
        .then(async res => {

          console.log('User credential received - if it has user, remove line 244 ', res);
          if (this.loading) {
            //   this.loading.dismiss(); // let's disable so the user wont wait until there is a transition
          }

          // this.inAppMessage.presentAlert('Phone number validated.<br> Thank you!');
          const user = await this.firebaseService.getAuthObject().currentUser;

          this.confirmationResult = undefined;
          this.phoneChanged = false;

          this.signupWithValidInviteCode(user);
        })
        .catch(error => {
          if (this.loading) {
            this.loading.dismiss();
          }

          this.inAppMessage.presentToast('Invalide code provided.' + error);
          this.confirmationResult = undefined;
        });
    } else {
      this.inAppMessage.presentToast('Invalide code provided.');
    }
  }


  @GoogleAnalytics('signup')
  async signupWithValidInviteCode(user: any) {
    this.content.scrollToTop();

    console.log('Signing up with valid code');

    //  console.log('finished clear');
    const userForApp = this.userService.validate({
      ...user,
      photoURL: 'assets/icon/pwa/apple-icon-180.png',
      inviteCode: '',
      fullName: this.fullName,
      displayName: this.fullName,
      userID: user.uid,
      joinedSince: Date.now(),
      whatsAppNr: user.phoneNumber,
      // emailVerified: user.emailVerified,
      providerId: user.providerData[0].providerId.replace('.com', ''), // I wonder if we are going to regret this

      // reset some setting because of new device
      appInstalled: false,
      pushNotificationsEnabled: false,
      userAgent: 'unknown'
    });

    if ('userAgent' in navigator) {
      userForApp.userAgent = navigator.userAgent;
    }

    // let's see if we can find the user online
    console.log('handleSuccesfulLogin - checking remote user', user);
    this.firebaseService.doc('/users/' + user.uid + '/userdata/' + user.uid).get()
      .pipe(timeout(2000),
        take(1)
        // first()
      )
      .subscribe(
        async doc => {
          console.log('handleSuccesfulLogin - checking remote user Found doc', doc, doc.exists);

          let navPath = '/tabs/myplots';

          if (this.loading) {
            this.loading.dismiss();
          }

          if (!doc.exists) {
            this.userService.setTempUser(userForApp);
            //  this.userService.upsert(userForApp);
          }

          if (doc.exists) {
            navPath = '/tabs/marketplace';
            //  this.userService.pushUserToState(doc.data() as User);
          }

          this.router.navigateByUrl(navPath);
        });
  }

  @GoogleAnalytics('signup')
  cancelConfirmSMSCode() {
    this.showConfirmbutton = true;
    this.setRecaptcha();
  }

  @GoogleAnalytics('signup')
  showToS() {
    this.inAppMessage.presentAlert(
      'Terms of Service: Kuyua is in beta. Which means many things in the app could you wrong. And likely will go wrong. We will store data and remove it after beta. If you wish your data not stored, remove the account or just do not register!'
    );
  }

  @GoogleAnalytics('signup')
  showPrivacy() {
    this.inAppMessage.presentAlert(
      'Kuyua is in beta. We value your privacy like we value ours. We will not resell your data, not disclose to third parties and you can remove your data by removing your account or just do not signup.'
    );
  }

  async presentCookieConsent() {
    const toast = await this.toastController.create({
      header: 'Cookie consent',
      message: 'We are using cookies to optimise this app. By using this app you consent to having these cookies placed.',
      position: 'top',
      duration: 0,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            window.localStorage.setItem(cookieOkPath, 'Accepted :' + Date.now());
          }
        }
      ]
    });
    toast.present();
  }


  processCommands() {
    console.log('COMMANDS', this.command, this.payload);

    if (this.command === undefined || this.command === null) {
      return;
    }

    if (this.payload === undefined || this.payload === null) {
      return;
    }

    GoogleAnalytics('login', 'command_' + this.command)();

    const doNothingWithThis = this.inAppMessage.processInAppCommands(this.command, this.payload);
  }

}
