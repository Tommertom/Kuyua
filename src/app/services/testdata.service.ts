import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class TestDataGeneratorService {

  avatars: string[] = [];
  words: string[] = [];

  constructor(
    private http: HttpClient,
    private toastcontroller: ToastController
  ) {
    this.http.get<{ name: string, url: string }[]>('assets/json/avatargallery.json')
      .subscribe(
        data => {
          if (data) {
            data.map(item => {
              this.avatars.push(item.url);
            });
          }
        }
      );

    this.http.get<{ sentence: string }>('/assets/json/text.json')
      .subscribe(
        data => {
          // console.log('TESTDATA', data);
          if (data) {
            this.words = data.sentence.toLowerCase()
              .split(' ')
              .filter(word => word.length > 5)
              .map(word => word.replace('.', ''));
          }
        }
      );
  }


  getRandomSentence(numberOfWords): string {
    let retValue = '';
    for (let i = 0; i < numberOfWords; i++) {
      retValue = retValue + this.words[Math.floor(Math.random() * this.avatars.length)] + ' ';
    }
    return retValue.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  getRandomAvatar(): string {
    return this.avatars[Math.floor(Math.random() * this.avatars.length)];
  }

  getRandomEnum(val: any): string {
    const keys = Object.keys(val);
    const randomkey = keys[Math.floor(Math.random() * keys.length)];
    return val[randomkey];
  }

  getRandomArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getRandomBoolean(chance) {
    return Math.random() > chance;
  }

  getRandomUID() {
    return 'uid' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  }


  getRandomNumber(range: number): number {
    return Math.floor(Math.random() * range);
  }

  getRandomDate(future: boolean): number {
    const elapsed = (Math.floor(Math.random() * 1000) * 1000 * 60 * 60);
    return future ? Date.now() + elapsed : Date.now() - elapsed;
  }

  async showToast(message) {
    const toast = await this.toastcontroller.create({
      position: 'top',
      message,
      duration: 12000,
      buttons: [
        {
          text: 'Done',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    toast.present();
  }
}
