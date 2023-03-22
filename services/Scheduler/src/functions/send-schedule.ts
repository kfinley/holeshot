
import { SNSEvent, Context } from 'aws-lambda';
import { StartStepFunctionCommand, GetEntitiesCommand, GetEntitiesRequest } from '@holeshot/aws-commands/src';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import bootstrapper from './bootstrapper';

const container = bootstrapper();

const getEntities = container.get<GetEntitiesCommand>("GetEntitiesCommand");
const startStepFunction = container.get<StartStepFunctionCommand>("StartStepFunctionCommand");

export interface GetEntitiesParams extends GetEntitiesRequest {
  connectionId: string; // websocket connection ID added by run-lambda command
  username: string;
}

export const handler = async (event: SNSEvent, context: Context) => {

  console.log(event);

  const { userId, connectionId } = JSON.parse(event.Records[0].Sns.Message);

  const today = new Date(new Date().setHours(0, 0, 0, 0)).toJSON();

  const response = await getEntities.runAsync({
    keyConditionExpression: "PK = :PK AND SK >= :today",
    expressionAttributeValues: {
      ":PK": `USER#${userId}#EVENT`,
      ":today": today,
    },
    filterExpression: ":isActive = 1",
    container
  });

//  console.log('getEntities.Items', response.items);

  const schedule = [];

  response.items.map(i => {
    const event = unmarshall(i);
    delete event["PK"];
    delete event["SK"];
    delete event["type"];
    delete event["isActive"]
    
    console.log('event', event);
    
    schedule.push(event);
  });

  const startStepFunctionResponse = await startStepFunction.runAsync({
    input: JSON.stringify({
      subject: "Scheduler/setSchedule", // This will be the store module action run when the client receives the message
      message: JSON.stringify({
        connectionId,
        schedule
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
