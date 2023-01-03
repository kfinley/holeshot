import { CognitoIdentityProvider, MessageActionType } from '@aws-sdk/client-cognito-identity-provider';
import { Command } from '@holeshot/commands/src';
import { inject, injectable } from 'inversify-props';

const USER_POOL_ID = process.env.USER_POOL_ID as string;

export type CreateCognitoUserCommandRequest = {
  lastName: string;
  firstName: string;
  email: string;
  userId?: string;
}

export type CreateCognitoUserCommandResponse = {
  success: boolean;
  firstName: string;
  lastName: string;
  userId?: string;
  tempPassword?: string;
  email: string;
}

@injectable()
export class CreateCognitoUserCommand implements Command<CreateCognitoUserCommandRequest, CreateCognitoUserCommandResponse> {

  @inject("CognitoIdentityProvider")
  private cognitoIdentityProvider!: CognitoIdentityProvider

  async runAsync(params: CreateCognitoUserCommandRequest): Promise<CreateCognitoUserCommandResponse> {

    try {

      // console.log('CreateCognitoUserCommand');

      const tempPassword = Math.random().toString(36).slice(-8); //generate random password: https://stackoverflow.com/a/9719815

      const response = await this.cognitoIdentityProvider.adminCreateUser({
        UserPoolId: USER_POOL_ID,
        Username: params.email,
        MessageAction: MessageActionType.SUPPRESS,
        TemporaryPassword: tempPassword,
        UserAttributes: [
          {
            Name: "email",
            Value: params.email
          },
          {
            Name: "given_name",
            Value: params.firstName
          },
          {
            Name: "family_name",
            Value: params.lastName
          }
        ]
      });

      //console.log(response);

      if (response.$metadata.httpStatusCode >= 200 && response.$metadata.httpStatusCode <= 299) {

        const result = {
          ...params,
          success: true,
          tempPassword: tempPassword
        };

        return result;
      }
    }
    catch (e) {
      console.log('error in create-cognito-user.ts', e);
      throw e;
    }
    return {
      ...params,
      success: false
    };
  }
}
