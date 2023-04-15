//TODO: move this to the Core Service

import { Context } from 'aws-lambda';
import { StartStepFunctionCommand, PutEntityCommand, PutEntityRequest } from '@holeshot/aws-commands/src';

import bootstrapper from './bootstrapper';

const container = bootstrapper();

const putEntity = container.get<PutEntityCommand>("PutEntityCommand");
const startStepFunction = container.get<StartStepFunctionCommand>("StartStepFunctionCommand");

export interface PutEntityParams extends PutEntityRequest {
  connectionId: string; // websocket connection ID added by run-lambda command
  responseCommand?: string;
}

export const handler = async (params: PutEntityParams, context: Context) => {

  const response = await putEntity.runAsync({
    ...params, 
    container
  });

  if (params.responseCommand) {
    const { responseCommand } = params;

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
