import { SendConfirmationCommand, SendConfirmationRequest } from '../commands/sendRegistrationConfirmation';
import {
    Handler,
    Context,
} from 'aws-lambda';
import { createResponse } from '../create-response';
import bootstrapper from './../bootstrapper';

const container = bootstrapper();

export const handler: Handler = async (event: any, context: Context) => {

    // console.log('sendConfirmation event', event);
    // console.log('context', context);

    try {

      const request = event as SendConfirmationRequest;
      console.log('sendConfirmation', request);

      const saveUserCmd = container.get<SendConfirmationCommand>("SendConfirmationCommand");

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
