import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
} from 'aws-lambda';
import bootstrapper from '../bootstrapper';
import { SaveConnectionCommand } from '../commands';
import { createResponse } from '../createResponse';
import { PublishMessageCommand } from '@holeshot/aws-commands/src';

const container = bootstrapper();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context, callback) => {

  try {

    // console.log('connect');

    let { authorizer } = event.requestContext

    /* 
    console.log(`Authorizer: ${JSON.stringify(authorizer)}`);
    2023-03-20T16:04:26.725Z	62970e81-912b-4346-99a4-efd28e2a4177	INFO	Authorizer: 
    {
        "sub": "eb201755-c031-4f62-8225-29bdc6e1b8e7",
        "principalId": "eb201755-c031-4f62-8225-29bdc6e1b8e7",
        "integrationLatency": 3063,
        "given_name": "Kye",
        "family_name": "Finley",
        "email": "kyle@kylefinley.net"
    }
    */

    if (authorizer === null || authorizer === undefined) { // || authorizer.policyDocument === undefined
      return createResponse(event, 401, 'Unauthorized');
    }

    if ((authorizer !== null || authorizer === undefined)) { // && authorizer.policyDocument.Statement[0].Effect == "Allow"

      await container.get<SaveConnectionCommand>("SaveConnectionCommand").runAsync({
        userId: authorizer.principalId,
        connectionId: event.requestContext.connectionId as string
      });

      //TODO: Test to see if we can send this in authorizeConnection instead of here...
      await container.get<PublishMessageCommand>("PublishMessageCommand").runAsync({
        topic: 'Holeshot-ConnectedTopic',       // SNS Topic
        subject: 'WebSockets/connected',        // SendMessage lambda subscribes and subject is sent to client. {Store_Module}/{actionName} is dispatched on client Vuex store
        message: JSON.stringify({               // params sent to store action
          connectionId: event.requestContext.connectionId as string,
          userId: authorizer.principalId,     // This is the Cognito username (sub attribute) which is a GUID
        }),
        container
      });

      // If we didn't want to send the access token through SNS and step functions (logs) then we could
      // send it back in process (cons: failures).
      // container.get<SendMessageCommand>("SendMessageCommand").runAsync({
      //   connectionId: event.requestContext.connectionId as string,
      //   data: JSON.stringify({
      //     subject: 'Auth/token', // {Store_Module}/{actionName}
      //     message: JSON.stringify({ // params sent to store action
      //       userId: authorizer.principalId,
      //       access_token: authorizer.access_token
      //     })
      //   })
      // });

      return createResponse(event, 200, 'Success');
    }
    return createResponse(event, 401, 'Unauthorized');

  } catch (error) {
    console.log(error);
    return createResponse(event, 500, error as string);
  }
};
