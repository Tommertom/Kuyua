import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, filter, first, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppMessage, MessageTypes } from '../interfaces/message';

export type DismissHandler = (data: { data: any }) => void;


@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class InAppMessagesService {

  private messages$ = new BehaviorSubject<AppMessage[]>([]);

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
  ) {
    if (!environment.production || (window.location.hostname.includes('preview'))) {
      {
        this.messages$.subscribe(messages => {
          console.log('Message bus:', messages);
        });
      }
    }
  }

  getMessages$(): Observable<AppMessage[]> {
    return this.messages$ as Observable<AppMessage[]>;
  }

  getFirstMessageOfType$(messageType: MessageTypes): Observable<AppMessage> {
    return this.getMessages$()
      .pipe(
        untilDestroyed(this),
        map(messages => messages.filter(message => message.messageType === messageType)),
        filter(messages => messages.length === 1),
        map(messages => messages[0]),
        take(1)
        //  first()
      );
  }

  publishMessage(newMessage: AppMessage) {
    let messages = [...this.messages$.getValue()];
    messages = messages.filter(message => message.messageType !== newMessage.messageType);
    this.messages$.next([...messages, newMessage]);
  }

  removeMessagesOfType(messageType: MessageTypes) {
    this.messages$.next(this.messages$.getValue().filter(message => message.messageType !== messageType));
  }

  async presentAlert(alertOptions: any, onDidDismissHandler?: DismissHandler) {

    if (typeof alertOptions === 'string') {
      alertOptions = {
        //  cssClass: 'my-custom-class',
        header: 'Alert',
        // subHeader: 'Subtitle',
        message: alertOptions,
        buttons: ['OK']
      };
    }

    const alert = await this.alertController.create(alertOptions);
    if (onDidDismissHandler) {
      alert.onDidDismiss().then(onDidDismissHandler); // .then((data: { data: any }) => {
    }
    await alert.present();
  }

  async presentToast(toastOptions: any, onDidDismissHandler?: DismissHandler) {

    if (typeof toastOptions === 'string') {
      toastOptions = {
        message: toastOptions,
        duration: '2000'
      }
    }

    const toast = await this.toastController.create({ ...toastOptions, position: 'top' });
    if (onDidDismissHandler) {
      toast.onDidDismiss().then(onDidDismissHandler);
    }
    await toast.present();
  }


  processInAppCommands(command: string, payload: any): string {
    console.log('COMMANDS', command, payload);

    let returnResult = '';

    switch (command) {
      case MessageTypes.ViewInterestedBuyer:

        this.publishMessage({
          messageType: MessageTypes.ViewInterestedBuyer,
          payload
        });

        returnResult = '/tabs/mysales';

        // code block
        break;

      case MessageTypes.ViewPublishedOpportunity:

        this.publishMessage({
          messageType: MessageTypes.ViewPublishedOpportunity,
          payload
        });

        returnResult = '/tabs/marketplace';

        // code block
        break;
      default:
      // code block
    }

    return returnResult;
  }
}
