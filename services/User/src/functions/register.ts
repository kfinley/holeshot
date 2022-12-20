import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
} from 'aws-lambda';
import { createResponse } from '../create-response';
import bootstrapper from '../bootstrapper';
import { PublishMessageCommand, StartStepFunctionCommand } from '@holeshot/aws-commands/src';


const container = bootstrapper();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context, callback) => {

  console.log('event', event);
  console.log('context', context);
  console.log('authorizer', event.requestContext.authorizer);

  const sp = new URLSearchParams(event.body)
  console.log(sp);

  try {
    const response = await container
      .get<StartStepFunctionCommand>("StartStepFunctionCommand")
      .runAsync({
        input: event.body, // NOPE. Fix it
        stateMachineName: 'Holeshot-WebSockets-Register',
        container
      });
    // await container.get<PublishMessageCommand>("PublishMessageCommand").runAsync({
    //   topic: 'Holeshot-StartStepFunctionTopic',  // SNS Topic
    //   subject: 'Register',
    //   message: JSON.stringify({}),
    //   container
    // });
    return createResponse(event, 200, 'success');
  } catch (error) {
    console.log(error);
    return createResponse(event, 500, error as string);
  }
}
