import { S3CreateEvent, Context, Handler } from 'aws-lambda';
import bootstrapper from '../commands/bootstrapper';
import { SaveTrackInfoCommand } from './../commands/save-track-info';
import { createResponse } from './create-response';

const container = bootstrapper();

const saveTrackInfo = container.get<SaveTrackInfoCommand>("SaveTrackInfoCommand");

export const handler: Handler = async (event: S3CreateEvent, context: Context) => {

  try {

    // console.log('event', JSON.stringify(event));

    const { key } = event.Records[0].s3.object;

    const response = await saveTrackInfo.runAsync({
      key
    });

    // console.log(response);

    return createResponse(event, 200, JSON.stringify(event));

  } catch (error) {
    console.log(error);
    return createResponse(event, 500, error as string);
  }
};
