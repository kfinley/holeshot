import { Context } from 'aws-lambda';
import { GetNearbyEventsCommand, GetNearbyEventsRequest } from '../commands/get-nearby-events';
import { StartStepFunctionCommand } from '@holeshot/aws-commands/src';

import bootstrapper from './bootstrapper';

const container = bootstrapper();

const cmd = container.get<GetNearbyEventsCommand>("GetNearbyEventsCommand");

export interface GetNearbyEventsParams extends GetNearbyEventsRequest {
  userId: string; // email
}

export const handler = async (params: GetNearbyEventsParams, context: Context) => {

  console.log('params', params);

  try {

    const response = await cmd.runAsync(params);

    const startStepFunctionResponse = container.get<StartStepFunctionCommand>("StartStepFunctionCommand").runAsync({
      input: JSON.stringify({
        subject: 'RunLambda/response',
        message: JSON.stringify({
          userId: params.userId
        })
      }),
      stateMachineName: 'Holeshot-WebSockets-SendMessage',
      container
    });

    console.log('Responses:', { response, startStepFunctionResponse });

    return {
      status_code: 200
    };

  } catch (error) {
    console.log("error", error);
    return {
      status_code: 500,
      body: error
    }
  }
};
