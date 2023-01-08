import {
  Handler,
} from 'aws-lambda';
import bootstrapper from './../bootstrapper';
import { createResponse } from '../create-response';
import { CreateCognitoUserCommand, CreateCognitoUserCommandRequest } from '../commands/create-cognito-user';

const container = bootstrapper();

export const handler: Handler = async (event: any, context, callback) => {

  try {
    // console.log('event', event);
    // console.log('context', context);

    const request = event as CreateCognitoUserCommandRequest;

    request.userId = request.email;

    // console.log('request', request);

    const createUser = container.get<CreateCognitoUserCommand>("CreateCognitoUserCommand");

    const response = await createUser.runAsync(request);

    // console.log('response', response.success);

    return {
      ...event,
      ...response
    };

  } catch (error) {
    console.log('CreateUser error', error);
    return createResponse(event, 500, error as string);
  }
}
