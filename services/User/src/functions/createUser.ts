import {
  Handler,
} from 'aws-lambda';
import bootstrapper from './../bootstrapper';
import { createResponse } from '../create-response';
import { CreateCognitoUserCommand, CreateCognitoUserCommandRequest } from '../commands/create-cognito-user';

const container = bootstrapper();

export const handler: Handler = async (event: any, context, callback) => {

  try {

    const request = event as CreateCognitoUserCommandRequest;

    request.username = request.email;

    const response = await container.get<CreateCognitoUserCommand>("CreateCognitoUserCommand").runAsync(request);

    return {
      ...event,
      ...response
    };

  } catch (error) {
    console.log('CreateUser error', error);
    return createResponse(event, 500, error as string);
  }
}
