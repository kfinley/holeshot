import { LoginRequest, LoginResponse } from '../types';
import { AuthStatus } from '../store';
import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { config } from '@holeshot/web-core/src/config';

@injectable()
export class LoginCommand implements Command<LoginRequest, LoginResponse> {
  @Inject('CognitoIdentityProvider')
  private provider!: CognitoIdentityProvider;

  public async runAsync(login: LoginRequest): Promise<LoginResponse> {
    const request = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: config.ClientId,
      AuthParameters: {
        USERNAME: login.email,
        PASSWORD: login.password,
      },
    };

    try {
      const result = await this.provider.initiateAuth(request);

      // console.log('initiateAuth', result);

      if (result.AuthenticationResult) {
        return {
          status: AuthStatus.LoggedIn,
          authenticationResult: {
            accessToken: result.AuthenticationResult.AccessToken,
            expiresIn: result.AuthenticationResult.ExpiresIn,
            tokenType: result.AuthenticationResult.TokenType,
            refreshToken: result.AuthenticationResult.RefreshToken,
            idToken: result.AuthenticationResult.IdToken,
          },
        };
      }

      if (result.ChallengeName == 'NEW_PASSWORD_REQUIRED') {
        return {
          status: AuthStatus.NewPasswordRequired,
          session: result.Session,
        };
      }
    } catch (e) {
      if (e.message === 'Resource not found') {
        console.log('Confirm Cognito UserPool ClientID is correct.', e);
      } else {
        // console.log(e);
      }
      throw new Error(e.message);
    }

    return {
      status: AuthStatus.LoginFailed,
      error: 'login failed',
    };
  }
}
