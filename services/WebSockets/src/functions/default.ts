import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
} from 'aws-lambda';
import bootstrapper from '../bootstrapper';
import { createResponse } from '../createResponse';
import { IMessageCommand } from './../commands/messageCommand';

const container = bootstrapper();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context, callback) => {

  try {

    console.log('event', JSON.stringify(event));

    const { command, data } = JSON.parse(event.body);

    const payload = JSON.parse(data['payload']);
    payload['connectionId'] = event['requestContext']['connectionId'];
    
    data['payload'] = JSON.stringify(payload);

    console.log('data', JSON.stringify(data));

    await container
      .get<IMessageCommand>(`${command}Command`)
      .runAsync(data);

    return createResponse(event, 200, 'Success');

  } catch (error) {
    console.log(error);
    return createResponse(event, 500, error as string);
  }
}
