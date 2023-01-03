import { ApiClient, apiClient } from '@holeshot/api-client/src';
import { Container } from 'inversify-props';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { LoginCommand, SetPasswordCommand, RegisterCommand } from "./commands";
import { GetUserDetailsCommand } from './commands/getUserDetails';

export default function bootstrapper(container: Container) {

  // console.log('vue2-user bootstrapper');

  if (!container.isBound("CognitoIdentityProvider")) {
    container.bind<CognitoIdentityProvider>("CognitoIdentityProvider")
      .toDynamicValue(() => new CognitoIdentityProvider({
        endpoint: "http://localhost:9229",
        region: 'us-east-1'
      }));
  }

  // container.bind<CognitoIdentityProvider>("CognitoIdentityProvider")
  //   .toDynamicValue(() => new CognitoIdentityProvider({
  //     region: "us-west-1"
  //   }));

  addTransientIfNeeded<ApiClient>(apiClient, 'ApiClient', container);
  addTransientIfNeeded<LoginCommand>(LoginCommand, "LoginCommand", container);
  addTransientIfNeeded<RegisterCommand>(RegisterCommand, "RegisterCommand", container);
  addTransientIfNeeded<SetPasswordCommand>(SetPasswordCommand, "SetPasswordCommand", container);
  addTransientIfNeeded<GetUserDetailsCommand>(GetUserDetailsCommand, "GetUserDetailsCommand", container);

  // console.log(container);
}

function addTransientIfNeeded<T>(constructor: any, id: string, container: Container) {
  if (!container.isBound(id)) {
    container.addTransient<T>(constructor, id);
  }
}
