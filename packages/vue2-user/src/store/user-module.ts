import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { UserState, AuthStatus } from './state';
import { User, SetPasswordRequest, LoginRequest, AuthenticationResult } from './../types';
// import NotificationModule from "@finley/vue2-components/src/store/notification-module";
import { notificationModule } from '@finley/vue2-components/src/store/';
import { LoginCommand, SetPasswordCommand } from '../commands';
// import { container } from 'inversify-props';
import { authHelper } from '@holeshot/api-client/src/helpers';
import { GetUserDetailsCommand } from '@/commands/getUserDetails';
import { Inject } from 'inversify-props';

@Module({ namespaced: true, name: 'User' })
export default class UserModule extends VuexModule implements UserState {
  authStatus = AuthStatus.LoggedOut;
  authSession = '';
  currentUser!: User;
  authTokens: AuthenticationResult = {}; // AuthenticationResult;
  postAuthFunction = ''; //: string | undefined = undefined; // !: string; // look into this... shouldn't have to do this but if we don't then the prop isn't on the obj in plugin

  @Inject('LoginCommand')
  private loginCommand!: LoginCommand;

  @Inject('GetUserDetailsCommand')
  private getUserDetailsCommand!: GetUserDetailsCommand;

  @Inject('SetPasswordCommand')
  private setPasswordCommand!: SetPasswordCommand;

  @Action
  async login(params: LoginRequest) {
    notificationModule.dismissAll();

    this.context.commit(
      'mutate',
      (state: UserState) => (state.authStatus = AuthStatus.LoggingIn)
    );

    try {
      const login = await this.loginCommand.runAsync(params);

      if (login.status == AuthStatus.LoggedIn) {
        authHelper.setTokens(login.authenticationResult as AuthenticationResult);

        const userDetails = await this.getUserDetailsCommand.runAsync({
          accessToken: login.authenticationResult?.accessToken as string,
        });
        authHelper.username = () => userDetails.username;

        this.context.commit('mutate', (state: UserState) => {
          state.authTokens = login.authenticationResult;
          state.currentUser = {
            ...userDetails,
            fullName: `${userDetails.firstName} ${userDetails.lastName}`,
          };
        });

        if (this.postAuthFunction) {
          console.log('running postAuthFunction', this.postAuthFunction);
          this.context.dispatch(this.postAuthFunction, this.authTokens.accessToken, {
            root: true,
          });
        }
      }

      this.context.commit('mutate', (state: UserState) => {
        state.authStatus = login.status;
        state.authSession = login.session;
      });

      console.log(this.authSession);

      if (login.error) {
        throw new Error(login.error);
      }
    } catch (error) {
      this.context.commit(
        'mutate',
        (state: UserState) => (state.authStatus = AuthStatus.LoginFailed)
      );

      notificationModule.handleError({ error, rethrow: false });
    }
  }

  @Action
  async logout() {
    this.context.commit('mutate', (state: UserState) => {
      state.authStatus = AuthStatus.LoggedOut;
      state.authTokens = undefined;
      state.currentUser = undefined;
      state.authSession = undefined;
    });
  }

  @Action
  async changePassword(params: SetPasswordRequest) {
    notificationModule.dismissAll();

    this.context.commit(
      'mutate',
      (state: UserState) => (state.authStatus = AuthStatus.SettingPassword)
    );

    try {
      const session = params.session ?? this.authSession;

      console.log('user-module: session', session);
      console.log('user-module: authSession', this.authSession);

      const response = await this.setPasswordCommand.runAsync({
        previousPassword: params.previousPassword,
        proposedPassword: params.proposedPassword,
        username: params.username,
        session,
      });

      if (response) {
        if (response.authenticationResult) {
          this.context.commit('mutate', (state: UserState) => {
            state.authStatus = AuthStatus.LoggedIn;
            state.authTokens = response.authenticationResult as AuthenticationResult;
            state.authSession = undefined;
          });

          authHelper.setTokens(response.authenticationResult as AuthenticationResult);

          if (this.postAuthFunction) {
            this.context.dispatch(this.postAuthFunction, response.authenticationResult, {
              root: true,
            });
          }
        }

        if (response.error) {
          throw new Error(response.error);
        }
      } else {
        throw new Error('No response');
      }
    } catch (error) {
      this.context.commit(
        'mutate',
        (state: UserState) => (state.authStatus = AuthStatus.NewPasswordRequired)
      );

      notificationModule.handleError({ error, rethrow: false });
    }
  }

  @Mutation
  mutate(mutation: (state: UserState) => void) {
    mutation(this);
  }
}

// export const getUserModule = (store: Store<any>) => getModule(UserModule, store);
