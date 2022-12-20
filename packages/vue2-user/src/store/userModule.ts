import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators';
import { UserState, AuthStatus } from './state';
import { User, SetPasswordRequest, LoginRequest, AuthenticationResult } from './../types';
import NotificationModule from '@finley/vue2-components/src/store/notification-module';
import { notificationModule } from '@finley/vue2-components/src/store/'
import { LoginCommand, SetPasswordCommand } from "../commands";
import { container } from 'inversify-props';
import { authHelper } from '@holeshot/api-client/src/helpers'
import { GetUserDetailsCommand } from '@/commands/getUserDetails';
import { Store } from 'vuex';

@Module({ namespaced: true, name: 'User' })
export class UserModule extends VuexModule implements UserState {

  authStatus = AuthStatus.LoggedOut;
  authSession = "";
  currentUser!: User;
  authTokens!: AuthenticationResult;
  postAuthFunction!: string;

  notificationModule: any; // = container.get<NotificationModule>("Notification")

  @Action
  async login(params: LoginRequest) {
    this.notificationModule.dismissAll();

    this.context.commit('mutate',
      (state: UserState) => state.authStatus = AuthStatus.LoggingIn);

    try {
      const login = await container.get<LoginCommand>("LoginCommand").runAsync(params);

      if (login) {

        authHelper.setTokens(login.authenticationResult as AuthenticationResult);

        if (login.status == AuthStatus.LoggedIn) {

          const userDetails = await container.get<GetUserDetailsCommand>("GetUserDetailsCommand").runAsync({
            accessToken: login.authenticationResult?.accessToken as string
          });
          authHelper.username = () => userDetails.username;

          this.context.commit('mutate',
            (state: UserState) => {
              state.authTokens = login.authenticationResult;
              state.currentUser = {
                ...userDetails,
                fullName: `${userDetails.firstName} ${userDetails.lastName}`
              }
            });

          if (this.postAuthFunction) {
            this.context.dispatch(this.postAuthFunction, login.authenticationResult, { root: true });
          }
        }

        this.context.commit('mutate',
          (state: UserState) => {
            state.authStatus = login.status;
            state.authSession = login.session;
          });

        if (login.error) {
          throw new Error(login.error);
        }
      } else {
        throw new Error('No response');
      }
    } catch (error) {
      this.context.commit('mutate',
        (state: UserState) => state.authStatus = AuthStatus.LoginFailed);

      this.notificationModule.handleError({ error, rethrow: false });
    }
  }

  @Action
  async changePassword(params: SetPasswordRequest) {
    this.notificationModule.dismissAll();

    this.context.commit('mutate',
      (state: UserState) => state.authStatus = AuthStatus.SettingPassword);

    try {
      const response = await container.get<SetPasswordCommand>("SetPasswordCommand")
        .runAsync({
          previousPassword: params.previousPassword,
          proposedPassword: params.proposedPassword,
          username: params.username,
          session: params.session ?? this.authSession,
        });

      if (response) {
        if (response.authenticationResult) {
          this.context.commit("mutate", (state: UserState) => {
            state.authStatus = AuthStatus.LoggedIn;
            state.authTokens = response.authenticationResult as AuthenticationResult;
            state.authSession = undefined;
          });

          authHelper.setTokens(response.authenticationResult as AuthenticationResult);

          if (this.postAuthFunction) {
            this.context.dispatch(this.postAuthFunction, response.authenticationResult, { root: true });
          }
        }

        if (response.error) {
          throw new Error(response.error);
        }
      } else {
        throw new Error('No response');
      }
    } catch (error) {
      this.context.commit('mutate',
        (state: UserState) => state.authStatus = AuthStatus.NewPasswordRequired);

      this.notificationModule.handleError({ error, rethrow: false });
    }
  }

  @Mutation
  mutate(mutation: (state: UserState) => void) {
    mutation(this);
  }
}

// export const getUserModule = (store: Store<any>) => getModule(UserModule, store);
