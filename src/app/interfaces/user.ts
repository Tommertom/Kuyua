import { Prop } from '../services/data/generic.state.class';

export interface User {
  userID: string;
  fcmTokens: { [id: string]: string };
  lastLogout: number;
  hasCompletedWelcome: boolean;
  userAgent: string;
  providerId: string;
  emailVerified: boolean;
  mobileVerified: boolean;
  pushNotificationsEnabled: boolean;
  appInstalled: boolean;
  pincode: string;

  fullName: string;
  displayName: string;
  photoURL: string;
  email: string;
  whatsAppNr: string;
  country: string;
  language: string;
  homeGPS: { lat: number, lng: number };

  tagsOfInterest: string[];
  profile: {
    isSeller: boolean;
    isBuyer: boolean;
    isUser: boolean;
  };
  marketsOfInterest: string[];

  invitationCodes: string[];
  inviteCode: string;
}

export const UserProps: Prop[] = [
  { prop: 'userID', def: '' },
  { prop: 'emailVerified', def: false },
  { prop: 'pincode', def: '' },
  { prop: 'mobileVerified', def: false },
  { prop: 'pushNotificationsEnabled', def: false },
  { prop: 'appInstalled', def: false },
  { prop: 'fullName', def: '' },
  { prop: 'displayName', def: '' },
  { prop: 'photoURL', def: '' },
  { prop: 'email', def: '' },
  { prop: 'whatsAppNr', def: '' },
  { prop: 'country', def: '' },
  { prop: 'language', def: '' },
  { prop: 'homeGPS', def: { lat: 0.3208730561416851, lng: 32.580959738168175 } },
  { prop: 'tagsOfInterest', def: [] },
  { prop: 'hasCompletedWelcome', def: false },
  { prop: 'fcmTokens', def: {} },
  { prop: 'lastLogout', def: 0 },
  { prop: 'userAgent', def: '' },
  { prop: 'providerId', def: '' },
  { prop: 'invitationCodes', def: [] },
  { prop: 'marketsOfInterest', def: [] },
  { prop: 'inviteCode', def: '' },
  {
    prop: 'profile', def: {
      isSeller: false,
      isBuyer: false,
      isUser: false,
    }
  },
];

