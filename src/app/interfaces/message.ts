export interface AppMessage {
  messageType: MessageTypes;
  payload?: any;
}

export enum MessageTypes {
  VerifyMobile = 'VerifyMobile',
  InstallApp = 'InstallApp',
  AcceptNotifcations = 'AcceptNotifcations',
  DeniedNotifcations = 'DeniedNotifcations',
  NewAppVersion = 'NewAppVersion',
  ViewInterestedBuyer = 'viewbuyer',
  ViewPublishedOpportunity = 'opportunity',
  ViewProduction = 'production',
}
