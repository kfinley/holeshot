import { APIGatewayProxyHandler } from 'aws-lambda';
import { container } from 'inversify-props';
import { createResponse } from '../createResponse';
import bootstrapper from '../bootstrapper';
import { AuthorizeConnectionCommand } from '../commands';

bootstrapper();

const authConnectionCmd = () => container.get<AuthorizeConnectionCommand>("AuthorizeConnectionCommand");

export const handler: APIGatewayProxyHandler = async (event) => {

  const { Authorization } = event.headers;
  const token = event.headers["Sec-WebSocket-Protocol"];

  const response = await authConnectionCmd().runAsync({
    resource: '*', //TODO: tighten this up...
    authorization: Authorization,
    token,
  });

  if (response && response.success) {
    return response.authResponse;
  } else {
    return createResponse(event, 401, 'Unauthorized');
  }
};
