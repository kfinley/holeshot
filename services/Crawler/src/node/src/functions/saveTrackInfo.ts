import { SNSEvent, Context, Handler } from 'aws-lambda';
import bootstrapper from '../commands/bootstrapper';
import { SaveTrackInfoCommand } from './../commands/save-track-info';
import { createResponse } from './create-response';
const container = bootstrapper();

export const handler: Handler = async (event: SNSEvent, context: Context) => {

  try {

    console.log('event', JSON.stringify(event));

    const { keys } = JSON.parse(event.Records[0].Sns.Message);

    const response = await container.get<SaveTrackInfoCommand>("SaveTrackInfoCommand").runAsync({
      keys
    });

    console.log(response);

    return createResponse(event, 200, JSON.stringify(event));

  } catch (error) {
    console.log(error);
    return createResponse(event, 500, error as string);
  }
};
