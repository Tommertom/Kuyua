import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';

import { User, UserProps } from '../../interfaces/user';
import { FirebaseService } from '../firebase.service';
import { RealtimeRemoteStateService } from './realtime-remote.state.class';
import { Observable, of } from 'rxjs';
import { LoadStates } from './generic.state.class';

const adminUIDs = ['fsxElr33emUSoQD5hl0zeDu5caF2'];

@Injectable({
  providedIn: 'root',
})
export class UserService extends RealtimeRemoteStateService<User> {

  tempUser: User = null;

  constructor(protected firebaseService: FirebaseService) {
    super('userID', '/users/[UID]/userdata/', firebaseService);
    this.setEntityProperties(UserProps);
  }

  setTempUser(user: User) {
    this.tempUser = user;
  }

  getTempUser() {
    return this.tempUser;
  }

  userIsAdmin() {
    return adminUIDs.includes(this.peekUser().userID);
  }

  pushUserToState(user: User) {
    this.setState({
      ids: [user.userID],
      entityMap: {
        [user.userID]: user
      },
      loadState: LoadStates.Loaded,
      errorMessage: null
    });
  }

  // superseding the validation for migration purposes
  validate(data: any): User {

    const generateRandomString = (length = 5) => Math.random().toString(20).substr(2, length);

    const newData: User = super.validate(data);

    // fix 1
    if (newData.fullName === '') {
      newData.fullName = newData.displayName;
    }

    // fix 2
    if (newData.invitationCodes.length !== 2) {
      const code1 = generateRandomString(5); // generateId(5).toUpperCase(); // Math.random().toString(36).substring(8).toUpperCase();
      const code2 = generateRandomString(5); //  Math.random().toString(36).substring(8).toUpperCase();
      newData.invitationCodes = [code1, code2];
    }

    return newData;
  }

  peekUser(): User {
    const uid = this.userID;
    if (uid === null) {
      return this.validate({}) as User;
    } else {
      return { ...this.state.entityMap[uid] } as User;
    }
  }

  getUser$(): Observable<User> {
    return this.entitiesAsArray$
      .pipe(map(listUsers => listUsers[0]));
  }

  setUserProperty(keyvalue: { prop: string; value: any }) {
    return this.setUserProperties([keyvalue]);
  }

  // we really need this? cant we use generic state?
  setUserProperties(keyvalues: { prop: string; value: any }[]) {
    return this.updatePropsOfEntity(keyvalues, this.userID);
  }

  // we cannot assume a valid user in the state, given the fact that getToken is invoked before user state loaded (new user)
  upsertNotificationToken(token: { [id: string]: string }) {
    if (this.state.entityMap[this.userID] === undefined) {
      return;
    }
    const newTokens = Object.assign({}, this.state.entityMap[this.userID].fcmTokens, token);
    this.setUserProperty({ prop: 'fcmTokens', value: newTokens });
  }

}
