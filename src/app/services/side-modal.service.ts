import { Injectable } from '@angular/core';
import { ModalController, AnimationController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SideModalService {

  constructor(
    public animationCtrl: AnimationController,
    private modalController: ModalController
  ) { }

  dismiss() {
    this.modalController.dismiss();
  }

  create(options: any) {
    const enterAnimation = (baseEl: any) => {

      const backdropAnimation = this.animationCtrl.create()
        // tslint:disable-next-line: no-non-null-assertion
        .addElement(baseEl.querySelector('ion-backdrop')!)
        .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

      const wrapperAnimation = this.animationCtrl.create()
        // tslint:disable-next-line: no-non-null-assertion
        .addElement(baseEl.querySelector('.modal-wrapper')!)
        //    .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');
        .keyframes([
          { offset: 0, opacity: '0', transform: 'scale(1) translateX(100%)' },
          { offset: 0.1, opacity: '0.4', transform: 'scale(1) ' },
          { offset: 0.8, opacity: '0.8', transform: 'scale(1) translateX(0px)' },
          { offset: 1, opacity: '1', transform: 'scale(1) translateX(0px)' }
        ]);

      return this.animationCtrl.create()
        .addElement(baseEl)
        .easing('ease-out')
        .duration(150)
        .addAnimation([backdropAnimation, wrapperAnimation]);
    };

    const leaveAnimation = (baseEl: any) => {
      return enterAnimation(baseEl).direction('reverse');
    };

    return this.modalController.create({
      ...options,
      leaveAnimation, enterAnimation,
    });
  }

}
