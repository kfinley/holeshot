import { Context } from 'aws-lambda';

import bootstrapper from './../bootstrapper';

const container = bootstrapper();

export const handler = async (params: any, context: Context) => {

  try {

    //const cmd = container.get<StartStepFunctionCommand>("StartStepFunctionCommand");

    // const response = await cmd.runAsync({
    //   input: JSON.stringify({
    //     subject: event.Records[0].Sns.Subject,
    //     message: event.Records[0].Sns.Message
    //   }),
    //   stateMachineName,
    //   container
    // });

    // console.log('response', response);

    return {
      // status_code: response.statusCode
    };

  } catch (error) {
    console.log("error", error);
    return {
      status_code: 500,
      body: error
    }
  }
};
