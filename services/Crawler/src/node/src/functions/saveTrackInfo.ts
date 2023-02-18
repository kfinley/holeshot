import { Context, Handler } from 'aws-lambda';
import bootstrapper from '../commands/bootstrapper';
// import { SaveTrackInfoCommand } from './../commands/save-track-info';
import { createResponse } from './create-response';
// import { Track } from '@holeshot/types/src';

const container = bootstrapper();

export const handler: Handler = async (event: any, context: Context) => {

  try {

    console.log('event', event);

    // const response = await container.get<SaveTrackInfoCommand>("SaveTrackInfoCommand").runAsync({
    //   track: event as Track
    // });

    return createResponse(event, 200, JSON.stringify(event));

    return {
      ...event,
      // ...response
    };

  } catch (error) {
    console.log(error);
    return createResponse(event, 500, error as string);
  }
};
