import { SaveUserCommand, SaveUserRequest } from '../commands/save-user';
import {
  Context,
  Handler,
} from 'aws-lambda';
import { createResponse } from '../create-response';
import bootstrapper from './../bootstrapper';

const container = bootstrapper();

export const handler: Handler = async (event: any, context: Context) => {

  console.log('saveUser event', event);
  // console.log('context', context);

  const request = event as SaveUserRequest;

  console.log(request);

  try {
    const saveUserCmd = container.get<SaveUserCommand>("SaveUserCommand");

    const response = await saveUserCmd.runAsync(request);

    return {
      ...event,
      ...response
    };

  } catch (error) {
    console.log(error);
    return createResponse(event, 500, error as string);
  }
}
