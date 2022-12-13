import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
} from 'aws-lambda';
import { createResponse } from '../create-response';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context, callback) => {

  console.log('event', event);
  console.log('context', context);
  console.log('authorizer', event.requestContext.authorizer);
  
  try {
    return createResponse(event, 200, 'success');
  } catch (error) {
    console.log(error);
    return createResponse(event, 500, error as string);
  }
}
