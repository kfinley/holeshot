import { Context } from 'aws-lambda';
import { PublishMessageCommand } from '@holeshot/aws-commands/src';
import bootstrapper from './../bootstrapper';

const container = bootstrapper();

export const handler = async (event: any, context: Context) => {

  try {

    console.log(`PostAuthentication:`, event.request.userAttributes);

    if (event.request.userAttributes["cognito:user_status"] == 'FORCE_CHANGE_PASSWORD') {
      return event;
    }

    const response = await container.get<PublishMessageCommand>("PublishMessageCommand").runAsync({
      topic: 'Holeshot-PostAuthenticationTopic',  // SNS Topic
      subject: 'Auth/postAuthentication',        // {Store_Module}/{actionName} on client if message sent to client
      message: JSON.stringify(event),
      container
    });

    console.log('response', response);
    return event;

    // return createResponse(event, 200, 'success');

  } catch (error) {
    console.log("error", error);
    return {
      status_code: 500,
      body: error
    }
  }
};
