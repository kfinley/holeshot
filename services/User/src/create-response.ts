import { APIGatewayProxyEvent } from "aws-lambda";

export function createResponse(event: APIGatewayProxyEvent, statusCode: number, body: string) {

  let response = {
    statusCode,
    body,
    headers: {
      'Content-Type': 'application/json',
      // 👇 allow CORS for all origins
      'Access-Control-Allow-Origin': 'https://holeshot-bmx.com', // Required for CORS support to work
      'Access-Control-Allow-Headers':
        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
      'Access-Control-Allow-Credentials': 'true', // Required for cookies, authorization headers with HTTPS
      'Access-Control-Allow-Methods': 'OPTIONS,GET,PUT,POST,DELETE',
    },
  };

  return response;
};
