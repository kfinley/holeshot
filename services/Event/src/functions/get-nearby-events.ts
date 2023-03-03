import { Context } from 'aws-lambda';
import { GetNearbyEventsCommand } from '../commands/get-nearby-events';

import bootstrapper from './bootstrapper';

const container = bootstrapper();

const cmd = container.get<GetNearbyEventsCommand>("GetNearbyEventsCommand");

export const handler = async (params: any, context: Context) => {

  try {

    const response = await cmd.runAsync(params);

    console.log('response', response);

    return response;

  } catch (error) {
    console.log("error", error);
    return {
      status_code: 500,
      body: error
    }
  }
};
