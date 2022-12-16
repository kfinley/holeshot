import 'reflect-metadata';

// import bootstrapper from "../../src/bootstrapper";
import { handler } from '../../src/functions/startStepFunction';

import event from '../data/register-event.json';

describe("startStepFunction", () => {

  const context = {
    awsRequestId: 'ckshohv7y00040kp6fhg28r7h',
    callbackWaitsForEmptyEventLoop: true,
    clientContext: undefined,
    functionName: 'Platform8-Dev-WebSockets-StartStepFunction',
    functionVersion: '$LATEST',
    identity: undefined,
    invokedFunctionArn: 'offline_invokedFunctionArn_for_Platform8-Dev-WebSockets-StartStepFunction',
    logGroupName: 'offline_logGroupName_for_Platform8-Dev-WebSockets-StartStepFunction',
    logStreamName: 'offline_logStreamName_for_Platform8-Dev-WebSockets-StartStepFunction',
    memoryLimitInMB: '1024',
    getRemainingTimeInMillis: () => { return 100 },
    done: () => { },
    fail: () => { },
    succeed: () => { }
  };

  describe("Success", () => {

    // let result: APIGatewayProxyResult | undefined = undefined;
    const saveConnectionRunAsyncMock = jest.fn();

    beforeAll(async () => {


      // result = await handler(event, context, () => { }) as APIGatewayProxyResult;
    });

    it("should run", () => {
      // expect(result?.statusCode).toEqual(200);
    });
  });


});
