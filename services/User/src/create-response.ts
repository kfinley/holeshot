import { APIGatewayProxyEvent } from "aws-lambda";

export function createResponse(event: APIGatewayProxyEvent, statusCode: number, body: string) {

  let response = {
    statusCode,
    body
  };

  return response;
};
