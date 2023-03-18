import { Context } from 'aws-lambda';
import { PublishMessageCommand } from '@holeshot/aws-commands/src';
import bootstrapper from './../bootstrapper';

const container = bootstrapper();

export const handler = async (event: any, context: Context) => {

  try {

    console.log(`PostAuthentication:`, event.request.userAttributes);

    // if (event.request.userAttributes["cognito:user_status"] == 'FORCE_CHANGE_PASSWORD') {
    //   return event;
    // }

    // const response = await container.get<PublishMessageCommand>("PublishMessageCommand").runAsync({
    //   topic: 'Holeshot-AuthProcessedTopic',  // SNS Topic
    //   subject: 'User/postAuthentication',
    //   message: JSON.stringify({     // params sent to store action
    //     userId: authorizer.principalId,
    //   }),
    //   container
    // });

    // console.log('response', response);

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
