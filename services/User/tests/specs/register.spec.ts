import 'reflect-metadata';

import { APIGatewayProxyResult } from 'aws-lambda';
// import bootstrapper from "../../src/bootstrapper";
import { handler as register } from '../../src/functions/register';

import event from '../data/register-event.json';

describe("register", () => {

  const context = {
    awsRequestId: 'ckshohv7y00040kp6fhg28r7h',
    callbackWaitsForEmptyEventLoop: true,
    clientContext: undefined,
    functionName: 'holeshot-Dev-WebSockets-connect',
    functionVersion: '$LATEST',
    identity: undefined,
    invokedFunctionArn: 'offline_invokedFunctionArn_for_holeshot-Dev-WebSockets-connect',
    logGroupName: 'offline_logGroupName_for_holeshot-Dev-WebSockets-connect',
    logStreamName: 'offline_logStreamName_for_holeshot-Dev-WebSockets-connect',
    memoryLimitInMB: '1024',
    getRemainingTimeInMillis: () => { return 100 },
    done: () => { },
    fail: () => { },
    succeed: () => { }
  };

  describe("Success", () => {

    let result: APIGatewayProxyResult | undefined = undefined;
    const saveConnectionRunAsyncMock = jest.fn();

    beforeAll(async () => {

      // SaveConnectionCommand.prototype.runAsync = saveConnectionRunAsyncMock;
      // saveConnectionRunAsyncMock.mockReturnValue(Promise.resolve({
      //   success: true
      // }))

      // bootstrapper();

      // (event as any).requestContext.authorizer = {
      //   principalId: 'f0c15c35-f292-4ba6-95a9-e7042faab771',
      //   policyDocument: {
      //     Version: '2012-10-17',
      //     Statement: [
      //       {
      //         Action: 'execute-api:Invoke',
      //         Effect: 'Allow',
      //         Resource: '$connect'
      //       }
      //     ]
      //   }
      // };

      result = await register(event, context, () => { }) as APIGatewayProxyResult;
    });

    it("should run", () => {
      expect(result?.statusCode).toEqual(200);
    });
  });


});
