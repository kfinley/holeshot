import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
} from 'aws-lambda';
import { createResponse } from '../create-response';
import bootstrapper from '../bootstrapper';
import { StartStepFunctionCommand } from '@holeshot/aws-commands/src';

const container = bootstrapper();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context, callback) => {

  try {
    const response = await container
      .get<StartStepFunctionCommand>("StartStepFunctionCommand")
      .runAsync({
        input: event.body,
        stateMachineName: 'Holeshot-User-Register',
        container
      });
    return createResponse(event, 200, 'success');
  } catch (error) {
    console.log(error);
    return createResponse(event, 500, error as string);
  }
}
