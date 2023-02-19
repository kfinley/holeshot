export function createResponse(event: any, statusCode: number, body: string) {

  let response = {
    "statusCode": statusCode,
    "body": body,
  };

  return response;
};
