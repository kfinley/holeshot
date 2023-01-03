import { Context, Handler } from 'aws-lambda';
import bootstrapper from './../bootstrapper';
import { GetUserCommand } from './../commands/get-user';
import { createResponse } from './../create-response';

const container = bootstrapper();

export const handler: Handler = async (event: any, context: Context) => {

  try {
    const getUserCmd = container.get<GetUserCommand>("GetUserCommand");

    // console.log(`getUser`, event);

    const { email } = event;

    const response = await getUserCmd.runAsync({
      email
    });

    return {
      ...event,
      ...response
    };

  } catch (error) {
    console.log(error);
    return createResponse(event, 500, error as string);
  }
};
