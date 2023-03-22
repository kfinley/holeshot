//TODO: move this to the Core Service

import { Context } from 'aws-lambda';
import { StartStepFunctionCommand, UpdateEntityCommand, UpdateEntityRequest } from '@holeshot/aws-commands/src';

import bootstrapper from './bootstrapper';

const container = bootstrapper();

const UpdateEntity = container.get<UpdateEntityCommand>("UpdateEntityCommand");
const startStepFunction = container.get<StartStepFunctionCommand>("StartStepFunctionCommand");

export interface UpdateEntityParams extends UpdateEntityRequest {
  connectionId: string; // websocket connection ID added by run-lambda command
  responseCommand?: string;
}

export const handler = async (params: UpdateEntityParams, context: Context) => {

  const response = await UpdateEntity.runAsync({
    ...params, 
    container
  });

  if (params.responseCommand) {
    const { responseCommand } = params;

    // const message = JSON.stringify({
    //   connectionId: params.connectionId,
    //   ...response
    // });
    
    // console.log(message);

    const startStepFunctionResponse = await startStepFunction.runAsync({
      input: JSON.stringify({
        connectionId: params.connectionId,
        subject: responseCommand, // This will be the store module action run when the client receives the message
        message: JSON.stringify(response)
      }),
      stateMachineName: 'Holeshot-WebSockets-SendMessage',
      container
    });

    return {
      status_code: startStepFunctionResponse.statusCode,
      executionArn: startStepFunctionResponse.executionArn
    };
  }

  return {
    status_code: response.success ? 200 : 500
  }

}
