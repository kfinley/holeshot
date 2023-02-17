import { SNSEvent, Context } from 'aws-lambda';
import { StartStepFunctionCommand } from '@holeshot/aws-commands/src';
import bootstrapper from './../bootstrapper';

const container = bootstrapper();

export const handler = async (event: SNSEvent, context: Context) => {

  try {

    const { stateMachineName } = JSON.parse(event.Records[0].Sns.Subject);
    console.log(`Starting step function ${stateMachineName}`);

    if (!stateMachineName) {
      throw new Error('stateMachineName missing! The name of a step function must be provided as the SNS Subject in order to start a step function with that name.');
    }

    const cmd = container.get<StartStepFunctionCommand>("StartStepFunctionCommand");

    const response = await cmd.runAsync({
      input: JSON.stringify({
        subject: event.Records[0].Sns.Subject,
        message: event.Records[0].Sns.Message
      }),
      stateMachineName,
      container
    });

    // console.log('response', response);

    return {
      status_code: response.statusCode
    };

  } catch (error) {
    console.log("error", error);
    return {
      status_code: 500,
      body: error
    }
  }
};
