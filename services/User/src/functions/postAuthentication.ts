import { Context } from 'aws-lambda';
import { PublishMessageCommand } from '@holeshot/aws-commands/src';
import bootstrapper from './../bootstrapper';
import { createResponse } from '../create-response';

const container = bootstrapper();

export const handler = async (event: any, context: Context) => {

  try {

    console.log(`PostAuthentication:`, { event });

    const response = await container.get<PublishMessageCommand>("PublishMessageCommand").runAsync({
      topic: 'Holeshot-PostAuthenticationTopic',  // SNS Topic
      subject: 'Auth/postAuthentication',        // {Store_Module}/{actionName} on client if message sent to client
      message: JSON.stringify(event),
      container
    });

    console.log('response', response);

    return createResponse(event, 200, 'success');
  } catch (error) {
    console.log("error", error);
    return {
      status_code: 500,
      body: error
    }
  }
};
