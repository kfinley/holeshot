
import { Context } from 'aws-lambda';
import { StartStepFunctionCommand, GetEntitiesCommand, GetEntitiesRequest } from '@holeshot/aws-commands/src';

import bootstrapper from './bootstrapper';

const container = bootstrapper();

const getEntities = container.get<GetEntitiesCommand>("GetEntitiesCommand");
const startStepFunction = container.get<StartStepFunctionCommand>("StartStepFunctionCommand");

export interface GetEntitiesParams extends GetEntitiesRequest {
  connectionId: string; // websocket connection ID added by run-lambda command
  userId: string;
}

export const handler = async (params: GetEntitiesParams, context: Context) => {

  const response = await getEntities.runAsync({
    keyConditionExpression: "PK = :PK AND SK >= :today",
    expressionAttributeValues: {
      ":PK": `USER#${params.userId}#EVENTS`,
      ":today": new Date(new Date().setHours(0, 0, 0, 0)).toString(),
    }
  });

  console.log('getEntities.Items', response.items);

  const startStepFunctionResponse = await startStepFunction.runAsync({
    input: JSON.stringify({
      subject: "Scheduler/setSchedule", // This will be the store module action run when the client receives the message
      message: JSON.stringify({
        connectionId: params.connectionId,
        userId: params.userId,
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
