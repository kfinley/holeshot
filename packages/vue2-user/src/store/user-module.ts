import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { UserState, AuthStatus } from './state';
import { User, SetPasswordRequest, LoginRequest, AuthenticationResult } from './../types';
import { notificationModule } from '@finley/vue2-components/src/store/';
import { LoginCommand, SetPasswordCommand } from '../commands';
import { authHelper } from '@holeshot/api-client/src/helpers';
import { GetUserDetailsCommand } from '@/commands/getUserDetails';
import { Inject } from 'inversify-props';

@Module({ namespaced: true, name: 'User' })
export default class UserModule extends VuexModule implements UserState {
  authStatus = AuthStatus.LoggedOut;
  authSession = '';
  currentUser: User | null = null;
  authTokens: AuthenticationResult = {}; // AuthenticationResult;
  postAuthFunction = ''; //: string | undefined = undefined; // !: string; // look into this... shouldn't have to do this but if we don't then the prop isn't on the obj in plugin

  @Inject('LoginCommand')
  private loginCommand!: LoginCommand;

  @Inject('GetUserDetailsCommand')
  private getUserDetailsCommand!: GetUserDetailsCommand;

  @Inject('SetPasswordCommand')
  private setPasswordCommand!: SetPasswordCommand;

  @Action
  async loadUser(params: AuthenticationResult) {
    try {
      const userDetails = await this.getUserDetailsCommand.runAsync({
        accessToken: params.accessToken as string,
      });

      authHelper.setTokens(params);
      authHelper.username = () => userDetails.username;

      this.context.commit('mutate', (state: UserState) => {
        state.authTokens = params;
        state.currentUser = {
          ...userDetails,
          fullName: `${userDetails.firstName} ${userDetails.lastName}`,
        };
        state.authStatus = AuthStatus.LoggedIn;
      });
    } catch (error) {
      console.log(error);
      this.context.dispatch('logout');
    }
  }

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
        this.context.dispatch('loadUser', login.authenticationResult);

        if (this.postAuthFunction) {
          console.log('running postAuthFunction', this.postAuthFunction);
          this.context.dispatch(this.postAuthFunction, this.authTokens.accessToken, {
            root: true,
          });
        }
      }

      this.context.commit('mutate', (state: UserState) => {
        // state.authStatus = login.status; // don't need this anymore b/c it's being done in loadUser
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
      state.currentUser = null;
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
