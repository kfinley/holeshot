import { User, AuthenticationResult } from './../types';

export interface RegistrationState {
  error?: string;
  email?: string;
  status: RegistrationStatus;
}
export interface UserState {
  authStatus: AuthStatus;
  authSession?: string;
  currentUser?: User;
  authTokens?: AuthenticationResult;
  postAuthFunction?: string;
}

export enum RegistrationStatus {
  Unknown = 'Unknown',
  Failed = 'Failed',
  Registered = 'Registered',
  Registering = 'Registering',
  Success = 'Success',
}

export enum AuthStatus {
  LoggedOut = 'LoggedOut',
  LoggingIn = 'LoggingIn',
  LoggedIn = 'LoggedIn',
  LoginFailed = 'LoginFailed',
  NewPasswordRequired = 'NewPasswordRequired',
  SettingPassword = 'SettingPassword',
  Refreshing = 'Refreshing', // ???
  Registering = 'Registering', // ???
  Locked = 'Locked',
}
