import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { IonSlides, ModalController, IonContent, LoadingController } from '@ionic/angular';

import { ProductionService } from 'src/app/services/data/production.service';

import { Plot } from 'src/app/interfaces/plot';
import { CommodityService } from 'src/app/services/data/commodity.service';
import { Observable } from 'rxjs';
import { Commodity } from 'src/app/interfaces/commodity';
import { Production } from 'src/app/interfaces/Production';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { last, map, switchMap, take } from 'rxjs/operators';
import { createIsNaNValidator } from 'src/app/validators/number.validator';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';


import { resizeFile } from 'src/app/utils/helpers';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { User } from 'src/app/interfaces/user';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UserService } from 'src/app/services/data/user.service';
import { GoogleAnalytics } from 'src/app/decorators/ga';

@UntilDestroy()
@Component({
  selector: 'app-newproductionwizard',
  templateUrl: './newproductionwizard.page.html',
  styleUrls: ['./newproductionwizard.page.scss'],
})
export class NewproductionwizardPage implements OnInit {

  @Input() plot: Plot;

  @ViewChild('slides', { static: true }) slides?: IonSlides;

  @ViewChild('content', { static: true }) content?: IonContent;

  commodities$: Observable<Commodity[]>;

  newProduction: Production;
  newForm: FormGroup;

  customCommodity = '';

  tagInput = '';

  uploadProgress: Observable<number>;

  user: User;

  constructor(
    private modalcontroller: ModalController,
    private productionService: ProductionService,
    private commodityService: CommodityService,
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private loadingController: LoadingController,
    private userService: UserService,

  ) {
    this.newProduction = this.productionService.validate({}); // to avoid template errors (ngModel)
    this.commodities$ = this.commodityService.getCommoditys$().pipe(take(1));

    this.newForm =
      this.fb.group({
        commodityName: ['',
          Validators.compose(
            [Validators.required, Validators.min(5)]
          )],
        details: ['',
          Validators.compose(
            [Validators.required, Validators.min(5)]
          )],
        expectedQuantity: ['',
          Validators.compose(
            [Validators.required, createIsNaNValidator()]
          )],
        soldQuantity: ['',
          Validators.compose(
            [Validators.required, createIsNaNValidator()]
          )],
        /*
      productionStart: [0,
        Validators.compose(
          [Validators.required]
        )],
      productionEnd: [0,
        Validators.compose(
          [Validators.required]
        )],
        */
        isForSale: [false,
          Validators.compose(
            [Validators.required]
          )],
        tagInput: ['',
          Validators.compose(
            []
          )],
      });
  }

  // https://ionicframework.com/docs/api/datetime  - see recommendation on using date-fns
  ngOnInit() {
    this.userService.getUser$()
      .pipe(untilDestroyed(this))
      .subscribe(user => { this.user = user; });
  }

  cancelNewProduction() {
    this.closePopover();
  }


  @GoogleAnalytics('newproductionwizard')
  async upload(event) {
    console.log('Uploading', event.target.files);

    const loading = await this.loadingController.create({
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

      // create a random id
      const randomId = Math.random().toString(36).substring(2);
      const user = await this.firebaseService.getAuthObject().currentUser;
      ref = this.firebaseService.storage().ref('/images/' + user.uid + '/' + randomId);

      task = ref.put(blobRes);
      this.uploadProgress = task.snapshotChanges()
        .pipe(map(s => (s.bytesTransferred / s.totalBytes) * 100));

      // to replace with ref.getDownloadURL().then
      task.snapshotChanges().pipe(
        last(),
        switchMap(() => ref.getDownloadURL())
      ).subscribe(url => {
        if (loading) {
          loading.dismiss();
        }
        console.log('download url:', url);

        this.newProduction.photoURL = url;
        // this.newProduction.tags = this.cleanTagList([]);
        this.newForm.controls.commodityName.setValue('');
        this.newForm.controls.details.setValue('');
        this.nextSlide();
      },
        (error) => {
          console.log('Error uploading file', error);
        }
      );
    });
  }


  @GoogleAnalytics('newproductionwizard')
  ionViewWillEnter() {

    this.newForm.patchValue(this.productionService.validate({
      productionID: this.productionService.getUniqueID(),
      plotID: this.plot?.plotID,
      GPS: this.plot?.GPS,
      // productionStart,
      //  productionEnd
    }));
    //  this.slides.lockSwipeToNext(false);
    console.log('Newproduction plot', this.plot);

    this.newProduction = this.productionService.validate({
      plotID: this.plot?.plotID,
      GPS: this.plot?.GPS,
      //  productionStart,
      //  productionEnd
    }); // an empty Production to fill in this interaction

    console.log('New production created', this.newProduction);
  }

  // Lock slides at navigation (if we set the swiping free)
  ionSlideNextEnd() {
  }

  // not working
  async nextSlide() {
    //  await this.slides.lockSwipeToNext(true);
    console.log('Next slide');
    this.content.scrollToTop();
    await this.slides.slideNext();
    // await this.slides.lockSwipeToNext(false);
  }

  closePopover() {
    this.modalcontroller.dismiss();
  }

  // Step 1 - Commodity selected
  @GoogleAnalytics('newproductionwizard')
  commodityClicked(commodity: Commodity) {
    console.log('Commodity clicked', commodity);
    //  this.newProduction.commodityID = commodity.commodityID;
    // this.newProduction.commodityName = commodity.name;
    this.newProduction.photoURL = commodity.photoURL;
    //  this.newProduction.tags = this.cleanTagList([commodity.name]);
    this.newForm.controls.details.setValue(commodity.description);
    this.newForm.controls.commodityName.setValue(commodity.description);
    this.nextSlide();
  }

  @GoogleAnalytics('newproductionwizard')
  async finishWizard() {

    this.newProduction.market = this.user.country;

    const newProduction = this.productionService.validate({
      ...this.newProduction,
      ...this.newForm.value,
      creationDate: Date.now()
      //   publishToOthers: this.newForm.controls.isForSale.value
    });

    this.productionService.upsert(newProduction);
    if (newProduction.isForSale) {
      await this.productionService.syncPublishedOfProduction(newProduction);
    }
    this.closePopover();
  }
}

/*


    //  const productionStart = new Date(Date.now()).toISOString();
    // const productionEnd = new Date(Date.now() + 1000000).toISOString();
  cleanTagList(tagList: string[]): string[] {
    return tagList
      .filter(tag => tag.length > 1)
      .map(tag => tag.trim().toLowerCase())
      .sort()
      .filter((item, pos, ary) => !pos || item !== ary[pos - 1]); // make unique
  }

  tagEnterHit(inputEvent) {
    if (inputEvent.charCode === 13) {
      this.tagAddFromInput();
    }
  }

  tagAddFromInput() {
    this.newProduction.tags =
      this.cleanTagList(
        this.newProduction.tags.concat(this.newForm.controls.tagInput.value.trim().split(',')));
    this.newForm.controls.tagInput.setValue('');
  }

  removeTag(tagToRemove) {
    // console.log('Tag to remove', tagToRemove, this.tags)
    this.newProduction.tags = this.newProduction.tags.filter(tag => tag !== tagToRemove);
  }

            <ion-slide *ngIf='false'>
                <div class="slide">
                    <h2>Please provide tags about this production</h2>
                    <br><br>
                    <ion-chip (click)="removeTag(tag)" *ngFor="let tag of newProduction.tags"> {{tag}}
                        <ion-icon name="close-outline"></ion-icon>
                    </ion-chip>
                    <br><br>
                    <ion-input (keypress)="tagEnterHit($event)" formControlName="tagInput" placeholder="Type tags separated by comma's">
                    </ion-input>
                    <br>
                    <ion-button (click)="tagAddFromInput()">Add tags</ion-button>
                    <br><br><br>
                    <br><br><br><br>
                    <ion-button (click)="nextSlide()">Next step</ion-button>
                </div>
            </ion-slide>


                 <ion-item>
                        <ion-label position="stacked">Production start date</ion-label>
                        <ion-label>{{newProduction.productionStart | date:'longDate'}}</ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label position="stacked">Production ready date</ion-label>
                        <ion-label>{{newProduction.productionEnd | date:'longDate'}}</ion-label>
                    </ion-item>

    <ion-item>
                        <ion-label position="stacked">Planting date</ion-label>
                        <ion-datetime value="1990-02-19" formControlName="productionStart" placeholder="Select Date">
                        </ion-datetime>
                    </ion-item>

                    <ion-item>
                        <ion-label position="stacked">Expected harvesting date</ion-label>
                        <ion-datetime value="1990-02-19" placeholder="Select Date" formControlName="productionEnd">
                        </ion-datetime>
                    </ion-item>

*/
