import { Context } from 'aws-lambda';
import { GetNearbyEventsCommand, GetNearbyEventsRequest } from '../commands/get-nearby-events';
import { StartStepFunctionCommand } from '@holeshot/aws-commands/src';

import bootstrapper from './bootstrapper';

const container = bootstrapper();

const cmd = container.get<GetNearbyEventsCommand>("GetNearbyEventsCommand");

export interface GetNearbyEventsParams extends GetNearbyEventsRequest {
  connectionId: string; // websocket connection ID
}

export const handler = async (params: GetNearbyEventsParams, context: Context) => {

  console.log('params', params);

  try {

    const response = await cmd.runAsync(params);

    const startStepFunctionResponse = await container.get<StartStepFunctionCommand>("StartStepFunctionCommand").runAsync({
      input: JSON.stringify({
        subject: 'RunLambda/response',
        message: JSON.stringify({
          connectionId: params.connectionId,
          data: response
        })
      }),
      stateMachineName: 'Holeshot-WebSockets-SendMessage',
      container
    });

    console.log('Responses:', JSON.stringify({ startStepFunctionResponse }));

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
