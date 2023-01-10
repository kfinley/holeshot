import { APIGatewayProxyEvent } from "aws-lambda";

export function createResponse(event: APIGatewayProxyEvent, statusCode: number, body: string) {

  let response = {
    statusCode,
    body,
    headers: {
      // Required for CORS support to work
      'Access-Control-Allow-Origin': '*',
    },
  };

  return response;
};
