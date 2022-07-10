import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, AlertController, Platform, ToastController, ModalController, IonContent } from '@ionic/angular';
import { filter, first, take, timeout } from 'rxjs/operators';
import { MessageTypes } from 'src/app/interfaces/message';

import { UserService } from 'src/app/services/data/user.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { InAppMessagesService } from 'src/app/services/in-app-messages.service';
import { environment } from 'src/environments/environment';

import { GoogleAnalytics } from 'src/app/decorators/ga';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  @ViewChild('content', { static: true }) content: IonContent;

  version = '';

  email = null;

  pincode = '';

  validPIN = false;

  command = '';
  payload = '';

  navigatePath = '/tabs';

  showEmailSwitch = true;

  loading: HTMLIonLoadingElement;

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
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService,
    private inAppMessage: InAppMessagesService,
    private http: HttpClient,
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    private userService: UserService,
  ) { }

  ngOnInit() {
    //  console.log('HOSTNAME', location.href, location);

    // location.ancestorOrigins: ['https://go.kuyua.com']
    const uuid = Math.random().toString(36).slice(-6).toUpperCase();

    console.log(uuid);

    this.email = this.route.snapshot.paramMap.get('email');

    this.command = this.route.snapshot.paramMap.get('command');
    this.payload = this.route.snapshot.paramMap.get('payload');

    const goCode = this.route.snapshot.paramMap.get('gocode');
    if (typeof goCode === 'string') {
      this.command = MessageTypes.ViewPublishedOpportunity;
      this.payload = goCode;
    }
    this.processCommands();



    const lastEmail = window.localStorage.getItem('kuyuaLastEmail');
    console.log('THIS EMAIL', this.email, lastEmail);
    if (this.email === null) {
      this.email = lastEmail;
    }
    console.log('THIS EMAIL', this.email, lastEmail);


    // const lastMobile = window.localStorage.getItem('kuyuaLastMobile');

    const validateEmail = (email) => {
      // eslint-disable-next-line max-len
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    };

    if (!validateEmail(this.email)) {
      this.email = null;
    }

    console.log('Entering login with email', this.email);

    this.http.get('assets/json/time.txt', { responseType: 'text' }).subscribe(data => {
      console.log('Version', data);
      this.version = data;
      GoogleAnalytics('login', 'version_' + this.version)();
    });

    if (this.email === null && this.command === null) {
      this.email = 'No email - please enter email';
      this.changeEmail();
    }

    if (this.email === null && typeof this.command === 'string' && typeof this.payload === 'string') {
      //    this.email = 'No email - please enter email';
      this.router.navigateByUrl('/signup/' + this.command + '/' + this.payload);
    }
  }

  @GoogleAnalytics('login')
  ionViewDidEnter() {
    this.clearPin();
  }

  enter(n: string) {
    if (this.pincode.length < 5) {
      this.pincode += n;
      this.pins[this.pincode.length - 1].on = true;
      this.pins[this.pincode.length - 1].value = n;

      // console.log('PIN', this.pincode);

      this.validPIN = this.pincode.length === 4;

      if (this.validPIN) {
        this.confirmPin();
        return;
      }
    }
  }

  @GoogleAnalytics('login')
  back() {
    if (this.pincode.length > 0) {
      this.validPIN = false;
      this.pincode = this.pincode.slice(0, -1);
      this.pins[this.pincode.length].on = false;
      this.pins[this.pincode.length].value = '';
    }
  }

  clearPin() {
    this.validPIN = false;
    this.pincode = '';
    this.pins.map(pin => { pin.on = false; });
  }

  async confirmPin() {

    this.loading = await this.loadingCtrl.create({
      message: 'Logging in',
      duration: 15000,
    });
    this.loading.present();

    const startTimer = Date.now();

    this.firebaseService.emailLogin(this.email, this.pincode)
      .then(async result => {
        // do the login and if ok, set the email
        window.localStorage.setItem('kuyuaLastEmail', this.email);

        console.log('Successfull login', result);

        // we only want to login when we have been able to get data from the server
        this.userService.getUser$()
          .pipe(
            filter(user => user !== undefined && user !== null),
            take(1),
            timeout(10000)// we give it 10 seconds to complete
          )
          .subscribe(
            (user) => {

              this.content.scrollToTop();

              console.log('Userdata found', user);
              if (this.loading) {
                this.loading.dismiss();
              }
              this.router.navigateByUrl(this.navigatePath);
            },
            (err) => {
              console.log('Error', err);
              this.inAppMessage.presentAlert('Error logging in - could not establish connection with server - please check your connection and try again');
              this.firebaseService.signOut();
              this.clearPin();
            },
            () => {
              const endTimer = Date.now();
              const eventCategory = (endTimer - startTimer) < 1000 * 4 ? 'fast_login' : 'slow_login';

              GoogleAnalytics('login', eventCategory)();
            }
          );
      })
      .catch(error => {

        if (this.loading) {
          this.loading.dismiss();
        }
        this.inAppMessage.presentAlert('Error logging in ' + error);

        if (error.code === 'auth/user-not-found') {
          window.localStorage.removeItem('kuyuaLastEmail');
          this.router.navigateByUrl('/signup');
        }
      })
      .finally(() => {
        this.clearPin();
      });
  }

  @GoogleAnalytics('login')
  async changeEmail() {

    const alert = await this.alertController.create({
      // cssClass: 'my-custom-class',
      header: 'Enter email',
      inputs: [
        {
          name: 'email',
          type: 'text',
          placeholder: 'Email'
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
          handler: (data) => {
            console.log('Confirm Ok', data);

            const rawEmail = data.email;
            const validateEmail = (email) => {
              // eslint-disable-next-line max-len
              const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
              return re.test(String(email).toLowerCase());
            };

            if (!validateEmail(rawEmail)) {
              this.inAppMessage.presentToast('Invalid email address provided');
            } else {
              this.email = rawEmail;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  processCommands() {
    console.log('COMMANDS', this.command, this.payload);

    if (this.command === undefined || this.command === null) {
      return;
    }

    if (this.payload === undefined || this.payload === null) {
      return;
    }

    this.showEmailSwitch = false;

    GoogleAnalytics('login', 'command_' + this.command)();

    this.navigatePath = this.inAppMessage.processInAppCommands(this.command, this.payload);
  }

  @GoogleAnalytics('login')
  goToSignup() {
    this.router.navigateByUrl('/signup');
  }
}

/*
  <br>
    <ion-button [disabled]="!validPIN" *ngIf="showEmailSwitch" fill="clear " color="secondary " (click)="confirmPin() "> Next step
                            <ion-icon slot="end " name="arrow-forward "></ion-icon>
                        </ion-button>

*/
