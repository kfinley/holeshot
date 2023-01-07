import { ApiClient, apiClient } from '@holeshot/api-client/src';
import { Container } from 'inversify-props';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { LoginCommand, SetPasswordCommand, RegisterCommand } from "./commands";
import { GetUserDetailsCommand } from './commands/getUserDetails';

export default function bootstrapper(container: Container) {

  // console.log('vue2-user bootstrapper');
  if (!container.isBound("CognitoIdentityProvider")) {
    container.bind<CognitoIdentityProvider>("CognitoIdentityProvider")
      .toDynamicValue(() => process.env.NODE_ENV === 'production'
        ?
        new CognitoIdentityProvider({ region: "us-east-1" })
        :
        new CognitoIdentityProvider({
          endpoint: "http://localhost:9229",
          credentials: {
            accessKeyId: "local",
            secretAccessKey: "local",
          },
          region: "us-east-1",
        }));
  }


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
