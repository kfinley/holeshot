
import { Context } from 'aws-lambda';
import { AddEntityCommand, AddEntityRequest } from '../commands/add-entity';
import { StartStepFunctionCommand } from '@holeshot/aws-commands/src';

import bootstrapper from './bootstrapper';

const container = bootstrapper();

const addEntity = container.get<AddEntityCommand>("AddEntityCommand");
const startStepFunction = container.get<StartStepFunctionCommand>("StartStepFunctionCommand");

export interface AddEntityParams extends AddEntityRequest {
  connectionId: string; // websocket connection ID added by run-lambda command
  responseCommand?: string;
}

export const handler = async (params: AddEntityParams, context: Context) => {

  const response = await addEntity.runAsync(params);

  if (params.responseCommand) {
    const { responseCommand } = params;

    const startStepFunctionResponse = await startStepFunction.runAsync({
      input: JSON.stringify({
        subject: responseCommand, // This will be the store module action run when the client receives the message
        message: JSON.stringify({
          connectionId: params.connectionId,
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
  }

  return {
    status_code: response.success ? 200 : 500
  }

}
