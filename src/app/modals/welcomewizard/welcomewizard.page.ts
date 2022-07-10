import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ModalController, IonSlides, Platform, IonContent, LoadingController } from '@ionic/angular';

import { User } from 'src/app/interfaces/user';

import { UserService } from 'src/app/services/data/user.service';

import { TestDataGeneratorService } from 'src/app/services/testdata.service';
import { CountryService } from 'src/app/services/data/country.service';


import { Geolocation, Position } from '@capacitor/geolocation';

import { InAppMessagesService } from 'src/app/services/in-app-messages.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { GoogleAnalytics } from 'src/app/decorators/ga';


@Component({
  selector: 'app-welcomewizard',
  templateUrl: './welcomewizard.page.html',
  styleUrls: ['./welcomewizard.page.scss'],
})
export class WelcomewizardPage implements OnInit {

  markers = [];
  zoom = 9;
  center = {
    lat: 0.1624659155606832,
    lng: 38.15881223311215
  };
  options = {
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    //  maxZoom: 15,
    //  minZoom: 8,
  };
  width = '101%';

  radiusRange = '250';

  isIOS = false;
  canGetCurrentLocation = true;

  email = '';
  validEmail = true;
  pincode = '';

  validPIN = false;

  loadDummyData = false;
  @ViewChild('slides', { static: true }) slides: IonSlides;
  @ViewChild('content', { static: true }) content: IonContent;
  @Input() user: User;

  newUser: User;

  loading: HTMLIonLoadingElement;

  shouldAnimate = true;

  showCancelEmailCode = false;

  emailChecking = false;
  emailCode = '';

  validCode = false;

  flagURL = '';

  pins = [
    {
      pin: 1,
      on: false,
      value: ''
    },
    {
      pin: 2,
      on: false,
      value: ''
    },
    {
      pin: 3,
      on: false,
      value: ''
    },
    {
      pin: 4,
      on: false,
      value: ''
    },
  ];

  constructor(
    private loadingCtrl: LoadingController,
    private userService: UserService,
    private modalCtrl: ModalController,
    private http: HttpClient,
    private test: TestDataGeneratorService,
    private platform: Platform,
    private countryService: CountryService,
    private inAppMessageService: InAppMessagesService,
    private firebaseService: FirebaseService,
    private router: Router,
  ) { }

  ngOnInit() {
    console.log('Welcome wizard received user', this.user);
    this.newUser = this.userService.clone(this.user);

    this.isIOS = this.platform.is('ios');

    this.countryService.getCountryPhoneCodes().forEach(phoneCode => {
      if (this.user.whatsAppNr.includes(phoneCode)) {
        const country = this.countryService.getCountryDataByPhoneCode(phoneCode);
        this.newUser.country = country.countryID;
        this.center = country.defaultGPS;
        this.flagURL = country.flagPictureURL;
        this.newUser.marketsOfInterest = [country.countryID];
      }
    });

    this.canGetCurrentLocation = 'geolocation' in navigator;
  }


  @GoogleAnalytics('welcomewizard')
  ionViewDidEnter() {
    this.pincode = '';

    // the slides are for animation, not for the user to swipe, so we lock immediately
    if (this.slides) {
      this.content.scrollToTop();
      this.slides.lockSwipeToNext(false);
      this.slides.lockSwipeToPrev(false);
      this.slides.slideTo(0);
      this.slides.lockSwipeToNext(true);
      this.slides.lockSwipeToPrev(true);
    }

    // Google maps hack to force a refresh - otherwise we'll see gray square
    setTimeout(() => {
      this.width = '100%';
    }, 1000);
  }

  // Lock slides at navigation (if we set the swiping free)
  ionSlideNextEnd() {
    this.slides.getActiveIndex().then(index => {
      if (index > 0) {
        this.slides.lockSwipeToNext(true);
      }
    });
  }

  nextSlide() {
    this.content.scrollToTop();
    this.slides.lockSwipeToNext(false);
    this.slides.slideNext();
    this.slides.lockSwipeToNext(true);
  }

  previousSlide() {
    this.content.scrollToTop();
    this.slides.lockSwipeToPrev(false);
    this.slides.slidePrev();
    this.slides.lockSwipeToPrev(true);
  }

  //
  // Wizard specific methods
  //

  //
  // email
  //
  emailInput(event) {
    const validateEmail = (email) => {
      // eslint-disable-next-line max-len
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    };

    this.validEmail = !validateEmail(this.email);
  }

  codeInput(event) {
    this.validCode = this.emailCode.length === 4 && /^\d+$/.test(this.emailCode);
  }

  @GoogleAnalytics('welcomewizard')
  checkEmailBeforeCode() {
    console.log('check mail before code');
    this.firebaseService.linkCurrentUserProviderToEmail(this.email, this.pincode)
      .then(x => {
        this.emailChecking = true;
        console.log('Linking worked!!');
        this.sendConfirmationEmail();
      })
      .catch(async error => {
        console.log('Linking did not work', error);
        // 'auth/provider-already-linked'
        // auth/email-already-in-use
        if (error.code === 'auth/email-already-in-use') {
          //  this.inAppMessageService.presentAlert(this.email + ' is already in use.
          // Use pincode associated with that account to login or change to another email address.');


          this.inAppMessageService.presentAlert({
            // cssClass: 'my-custom-class',
            header: 'Alert',
            message: `${this.email} is already in use. Change to other email address or login with ${this.email}?`,
            buttons: [
              {
                text: 'Change email',
                //  role: 'cancel',
                //  cssClass: 'secondary',
                handler: (blah) => {
                  console.log('Confirm Change email');
                  this.email = '';
                }
              }, {
                text: 'Login',
                handler: () => {
                  console.log('Confirm Okay');
                  this.modalCtrl.dismiss({});
                  this.router.navigateByUrl('/login/' + this.email);
                  this.email = '';
                  this.firebaseService.signOut();
                }
              }
            ]
          });
        } else {
          this.inAppMessageService.presentAlert('Unknown error occurred - ' + error.code);
        }
      });
  }


  @GoogleAnalytics('welcomewizard')
  async sendConfirmationEmail() {

    console.log('confirmEmail sent', this.email, this.user.userID);
    this.showCancelEmailCode = false;

    this.loading = await this.loadingCtrl.create({
      message: 'Please wait - this may take a few minutes',
      duration: 13000,
    });
    this.loading.present();

    this.firebaseService.getIdtoken().then(sss => {

      this.firebaseService.doc('/confirmcodes/' + this.user.userID)
        .set({ email: this.email })
        .then(_ => {
          this.emailChecking = true;

          setTimeout(() => {
            this.showCancelEmailCode = true;
          }, 10 * 1000);

          if (this.loading) {
            this.loading.dismiss();
          }
          setTimeout(() => {
            this.inAppMessageService.presentToast('Please check your mailbox (or spam box) for a mail with the code');
          }, 2000);
        });

    });
  }

  @GoogleAnalytics('welcomewizard')
  async testCodeFromEmail() {

    console.log('confirm email code');
    this.loading = await this.loadingCtrl.create({
      message: 'Please wait - checking your code',
      duration: 3000,
    });
    this.loading.present();

    this.firebaseService.getIdtoken().then(async sss => {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + sss
        })
      };

      const id = this.user.userID;
      const code = this.emailCode;
      console.log('Testing', id, code);
      this.http.get('https://us-central1-kuyua-2199c.cloudfunctions.net/app/confirmcode/' + id + '/' + code, httpOptions)
        .subscribe(
          (y: { result: boolean }) => {
            console.log('Confirmation result', y);

            if (y.result) {
              this.emailChecking = false;
              this.newUser.emailVerified = true;
              this.completeAppSetup();
            }

            if (!y.result) {
              // this.emailChecking = false;
              console.log('Conf result is wrong', typeof y.result)
              this.inAppMessageService.presentToast('Wrong code provided - try again');
            }
          },
          (err) => { console.log('Error testing confirmcode', err); },
          () => {
            if (this.loading) {
              this.loading.dismiss();
            }
          });
    });
  }

  @GoogleAnalytics('welcomewizard')
  cancelEmailcodeAndGoOn() {

    this.emailChecking = false;
    this.newUser.emailVerified = false;
    this.completeAppSetup();
  }

  //
  // PINCODE
  //
  @GoogleAnalytics('welcomewizard')
  confirmPin() {

    /*
     this.pincode = this.pins
       .map(pin => pin.value)
       .reduce((a, v) => a + v);
 */
    this.nextSlide();
  }

  enter(n: string) {
    if (this.pincode.length < 5) {
      this.pincode += n;
      this.pins[this.pincode.length - 1].on = true;
      this.pins[this.pincode.length - 1].value = n;

      // console.log('PIN', this.pincode);

      this.validPIN = this.pincode.length === 4;
    }
  }

  back() {
    if (this.pincode.length > 0) {
      this.validPIN = false;
      this.pincode = this.pincode.slice(0, -1);
      this.pins[this.pincode.length].on = false;
      this.pins[this.pincode.length].value = '';
    }
  }


  // Step 3 - Location
  @GoogleAnalytics('welcomewizard')
  async markUsingCurrentLocation() {

    if ('permissions' in navigator) {
      const permissions = await Geolocation.checkPermissions();
      console.log('Permissions', permissions); // premissions.location  - granted, prompt, denied
      if (permissions.location === 'denied') {
        this.inAppMessageService.presentAlert('Permission to obtain your location denied. Please enable location access in privacy settings of your browser.');
        return;
      }
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    this.slides.lockSwipeToNext(false);

    let myLocation;
    try {
      const position = await Geolocation.getCurrentPosition(options) as Position;
      //  const currentPosition = position as Position;

      console.log('Position', position.coords);
      myLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      this.center = myLocation;
      this.markers = [{
        position: this.center,
        isMain: true,
      }];

      setTimeout(() => {
        this.nextSlide();
      }, 1000);

    } catch (err) {
      console.log('ERROR', err);
      this.test.showToast('ERROR ' + JSON.stringify(err));
    }
  }

  @GoogleAnalytics('welcomewizard')
  mapClick(event) {

    this.slides.lockSwipeToNext(false);

    // this.center = ;
    this.markers = [{
      position: {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      },
      isMain: true,
    }];

    this.center = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };

    setTimeout(() => {
      this.nextSlide();
    }, 1000);
  }

  @GoogleAnalytics('welcomewizard')
  async completeAppSetup() {

    // we need to be close to a user generated event
    if (!this.platform.is('ios')) {
      //  this.pwaService.initNotifications();
    }

    this.newUser.email = this.email;
    this.newUser.pincode = this.pincode;
    this.newUser.hasCompletedWelcome = true;
    this.newUser.homeGPS = this.center;
    this.newUser.mobileVerified = true;

    // let's create the avatar url
    let ref: AngularFireStorageReference;
    let task: AngularFireUploadTask;
    const user = await this.firebaseService.getAuthObject().currentUser;
    ref = this.firebaseService.storage().ref('/images/' + user.uid + '/photoURL.jpg'); //  + randomId

    this.http.get('assets/img/signuplogin/start_avatar.png', { responseType: 'blob' })
      .subscribe(async response => {
        task = ref.put(response);
        task.then(async () => {
          const photoURL = await ref.getDownloadURL().toPromise().catch(e => {
            console.log('Object does not exist?', e);
          })
          console.log('download url:', photoURL);
          this.newUser.photoURL = photoURL;
          this.userService.upsert(this.newUser);
        });
      }, (err) => {
        console.log('Error ', err);
      },
        () => {
          this.userService.upsert(this.newUser);
        });


    // this action saves the user for real
    window.localStorage.setItem('kuyuaLastEmail', this.email);
    this.nextSlide();
  }

  // finish the wizard with fake data
  @GoogleAnalytics('welcomewizard')
  async finishWizard() {

    this.modalCtrl.dismiss({ center: this.center });
  }
}



/*
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + sss
  })
};

//  const id = this.email + '/' + this.user.userID;

this.http.get('https://us-central1-kuyua-2199c.cloudfunctions.net/app/getcode/' + id, httpOptions)
  .subscribe(_ => {
    this.emailChecking = true;

    if (this.loading) {
      this.loading.dismiss();
    }
    this.inAppMessageService.presentToast('Please check your mailbox (and spam box) for a mail with the code');
  });
  */
