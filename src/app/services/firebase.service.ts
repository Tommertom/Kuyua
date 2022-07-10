import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/app-check';
// import 'firebase/analytics';


import { environment } from 'src/environments/environment';
import { AngularFireStorage } from '@angular/fire/storage';
import { from } from 'rxjs';

/*

Rules
https://firebase.google.com/docs/firestore/security/get-started
https://firebase.google.com/docs/firestore/security/rules-conditions
https://firebase.google.com/docs/firestore/security/rules-structure
https://medium.com/@khreniak/cloud-firestore-security-rules-basics-fac6b6bea18e
https://fireship.io/snippets/firestore-rules-recipes/

// taken from   https://angularfirebase.com/lessons/google-user-auth-with-firestore-custom-data/#Step-4-Auth-Guard

*/

@Injectable({ providedIn: 'root' })
export class FirebaseService {

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private fireStorage: AngularFireStorage
  ) { }


  enableAppCheck() {
    const appCheck = firebase.appCheck();
    // Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
    // key is the counterpart to the secret key you set in the Firebase console.
    appCheck.activate(
      '6LcNdt4eAAAAAK0BnXoIhhpHdY4RrGFtft2s9mtz',

      // Optional argument. If true, the SDK automatically refreshes App Check
      // tokens as needed.
      true);


    console.log('APPCHECK', appCheck);
  }

  async linkCurrentUserProviderToEmail(e, p) {
    const credential = firebase.auth.EmailAuthProvider.credential(e, p + 'PINCODE');
    const user = await this.afAuth.currentUser;
    return user.linkWithCredential(credential);
  }

  createEmailLogin(email, password) {
    return this.afAuth.createUserWithEmailAndPassword(
      email,
      password + 'PINCODE'
    );
  }

  emailLogin(e, p) {
    return this.afAuth.signInWithEmailAndPassword(e, p + 'PINCODE');
  }

  signOut() {
    return this.afAuth.signOut();
  }

  sendEmailLink(email, actioncodesettings) {
    return this.afAuth.sendSignInLinkToEmail(email, actioncodesettings);
  }

  storage(): AngularFireStorage {
    return this.fireStorage;
  }

  getAuthObject(): AngularFireAuth {
    return this.afAuth;
  }

  async isLoggedIn() {
    return await this.afAuth.currentUser !== null;
  }

  batch() {
    return this.afs.firestore.batch();
  }

  collection(collection: any, query?: any): AngularFirestoreCollection {
    if (query) {
      return this.afs.collection(collection, query);
    } else {
      return this.afs.collection(collection);
    }
  }

  doc(doc: string): AngularFirestoreDocument {
    return this.afs.doc(doc);
  }

  async getIdtoken() {
    const user = await this.afAuth.currentUser;
    const token = await user.getIdToken();
    return token;
  }

  async facebookLogin() {
    const provider = new firebase.auth.FacebookAuthProvider();
    function iOSSafari(userAgent) {
      return (
        /iP(ad|od|hone)/i.test(userAgent) &&
        /WebKit/i.test(userAgent) &&
        !/(CriOS|FxiOS|OPiOS|mercury)/i.test(userAgent)
      );
    }
    console.log('Facebook login', iOSSafari(window.navigator.userAgent), environment.production, provider);
    if (iOSSafari(window.navigator.userAgent) && environment.production) {
      return this.afAuth.signInWithRedirect(provider);
    } else {
      return this.afAuth.signInWithPopup(provider).then(async (result) => {
        return result.user;
      });
    }
  }

  async googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    function iOSSafari(userAgent) {
      return (
        /iP(ad|od|hone)/i.test(userAgent) &&
        /WebKit/i.test(userAgent) &&
        !/(CriOS|FxiOS|OPiOS|mercury)/i.test(userAgent)
      );
    }
    if (iOSSafari(window.navigator.userAgent) && environment.production) {
      this.afAuth.signInWithRedirect(provider);
      return null;
    } else {
      return this.afAuth.signInWithPopup(provider).then(async (result) => {
        return result.user;
      });
    }
  }

  async loginWebService(service: string) {
    // return this.facebookLogin();
    if (service === 'facebook') {
      return this.facebookLogin();
    } else if (service === 'google') {
      return this.googleLogin();
    } else {
      return from(undefined);
    }
  }

  private oAuthLogin(provider) {
    return this.afAuth.signInWithPopup(provider);
  }
}
