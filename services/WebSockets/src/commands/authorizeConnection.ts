import { Command } from '@holeshot/commands/src';
import { AuthorizeCommand, AuthorizeResponse } from "@holeshot/aws-commands/src";
import { Inject, injectable } from 'inversify-props';
import { container } from '../inversify.config';

export interface AuthorizeConnectionRequest {
  resource: string;
  authorization: string | undefined;
  token: string | undefined;
}

export interface AuthorizeConnectionResponse {
  authResponse?: any;
  success: boolean;
}


const generatePolicy = (principalId: any, effect: any, resource: any, attributes: Record<string, string>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authResponse: any = {};
  authResponse.principalId = principalId;

  if (effect && resource) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const policyDocument: any = {};
    // default version
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statement: any = {};
    // default action
    statement.Action = 'execute-api:Invoke';
    statement.Effect = effect;
    statement.Resource = resource;
    policyDocument.Statement[0] = statement;
    authResponse.policyDocument = policyDocument;
    authResponse.context = { effect } // blows up if context doesn't have any value
  }
  return authResponse;
};

const generateAllow = (principalId: string | undefined, resource: string, attributes: Record<string, string>) => generatePolicy(principalId, 'Allow', resource, attributes);

const generateDeny = (principalId: string | undefined, resource: string, attributes: Record<string, string>) => generatePolicy(principalId, 'Deny', resource, attributes);

const generateAuthResponse = (authResponse: AuthorizeResponse, resource: string | undefined) => {

  if (authResponse && authResponse.username && authResponse.authorized) {
    return generateAllow(authResponse.username, resource == undefined ? '$connect' : resource, authResponse.attributes);
  }
  return generateDeny(authResponse.username, resource == undefined ? '$connect' : resource, authResponse.attributes);

};

@injectable()
export class AuthorizeConnectionCommand implements Command<AuthorizeConnectionRequest, AuthorizeConnectionResponse> {

  @Inject("AuthorizeCommand")
  private authorizeCommand!: AuthorizeCommand;

  async runAsync(params: AuthorizeConnectionRequest): Promise<AuthorizeConnectionResponse> {

    let authResult;

    if (params.token) {
      authResult = await this.authorizeCommand.runAsync({ token: params.token, container });
    } else if (params.authorization) {
      authResult = await this.authorizeCommand.runAsync({ authHeader: params.authorization, container });
    }

    if (authResult) {

      const authResponse = generateAuthResponse(authResult, params.resource);

      return {
        authResponse,
        success: authResponse.policyDocument.Statement[0].Effect == 'Allow'
      }
    }
    else {
      return {
        success: false
      }
    }
  }
}
