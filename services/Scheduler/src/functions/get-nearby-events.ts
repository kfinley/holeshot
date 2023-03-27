import { Context } from 'aws-lambda';
import { GetNearbyEventsCommand, GetNearbyEventsRequest } from '../commands/get-nearby-events';
import { StartStepFunctionCommand } from '@holeshot/aws-commands/src';

import bootstrapper from './bootstrapper';

const container = bootstrapper();

const getNearbyEvents = container.get<GetNearbyEventsCommand>("GetNearbyEventsCommand");
const startStepFunction = container.get<StartStepFunctionCommand>("StartStepFunctionCommand");

export interface GetNearbyEventsParams extends GetNearbyEventsRequest {
  connectionId: string; // websocket connection ID added by run-lambda command
}

export const handler = async (params: GetNearbyEventsParams, context: Context) => {

  try {

    const response = await getNearbyEvents.runAsync(params);

    const startStepFunctionResponse = await startStepFunction.runAsync({
      input: JSON.stringify({
        subject: 'Search/getNearbyEventsResponse',
        connectionId: params.connectionId,
        message: JSON.stringify({
          ...response
        })
      }),
      stateMachineName: 'Holeshot-WebSockets-SendMessage',
      container
    });

    return {
      status_code: startStepFunctionResponse.statusCode,
      executionArn: startStepFunctionResponse.executionArn
    };

  } catch (error) {
    console.log("error", error);
    return {
      status_code: 500,
      body: error
    }
  }
};
