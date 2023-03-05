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

  //console.log('params', params);

  try {

    const response = await getNearbyEvents.runAsync(params);

    const startStepFunctionResponse = await startStepFunction.runAsync({
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

    // console.log('Responses:', JSON.stringify({ startStepFunctionResponse }));

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
