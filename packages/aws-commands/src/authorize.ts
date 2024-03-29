import { Inject, injectable } from 'inversify-props';
import { Command } from '@holeshot/commands/src';
import { CognitoIdentityProvider, AttributeType } from "@aws-sdk/client-cognito-identity-provider";
import { Container } from 'inversify-props';

export interface AuthorizeRequest {
  authHeader?: string;
  token?: string;
  container: Container;
}

export interface AuthorizeResponse {
  username?: string;
  attributes?: Record<string, string>;
  authorized: boolean;
  statusCode?: number;
  body?: string;
}

@injectable()
export class AuthorizeCommand implements Command<AuthorizeRequest, AuthorizeResponse> {

  // @Inject('CognitoIdentityProvider') // not working with error "No matching bindings found for serviceIdentifier: CognitoIdentityProvider"
  private provider!: CognitoIdentityProvider;

  async runAsync(params: AuthorizeRequest): Promise<AuthorizeResponse> {

    let token = params.token;
    this.provider = params.container.get<CognitoIdentityProvider>("CognitoIdentityProvider");

    if (params.authHeader) {
      const idAndToken = Buffer.from(params.authHeader.split(' ')[1], 'base64').toString()
      const [, accessToken] = idAndToken.split(':');
      token = accessToken;
    }

    if (token) {
      try {
        const user = await this.provider.getUser({
          AccessToken: token
        });

        if (user.$metadata.httpStatusCode === 200) {
          const attributes = this.attributesToRecord(user.UserAttributes);
          
          console.log(`Authorizer authorized: ${attributes.email}`)
          return {
            username: user.Username,
            attributes,
            authorized: true
          }
        }
      } catch (e: any) {
        if (e.message.indexOf('Access Token has expired') > -1) {
          console.log('AUTHORIZE: ', e);
          return {
            statusCode: 400,
            body: "Access Token has expired",
            authorized: false
          };
        }
      }
    }

    return {
      authorized: false
    }
  }

  attributesFromRecord(
    attributes: Record<string, string>
  ): readonly AttributeType[] {
    return Object.entries(attributes).map(([Name, Value]) => ({ Name, Value }));
  }

  attributesToRecord(
    attributes: readonly AttributeType[] | undefined
  ): Record<string, string> {
    return (attributes || []).reduce(
      (acc, attr) => ({ ...acc, [attr.Name as string]: attr.Value }),
      {}
    );
  }
}
function createResponse(event: Event | undefined, arg1: number, arg2: string): AuthorizeResponse | PromiseLike<AuthorizeResponse> {
  throw new Error('Function not implemented.');
}

