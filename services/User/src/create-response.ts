import { APIGatewayProxyEvent } from "aws-lambda";

export function createResponse(event: APIGatewayProxyEvent, statusCode: number, body: string) {

  let response = {
    statusCode,
    body,
    headers: {
      // Required for CORS support to work
      'Access-Control-Allow-Origin': '*',
      // Required for cookies, authorization headers with HTTPS
      'Access-Control-Allow-Credentials': true,
    },
  };

  return response;
};
