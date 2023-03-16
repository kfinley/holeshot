
import { Context } from 'aws-lambda';
import { GetNearbyEventsCommand, GetNearbyEventsRequest } from '../commands/get-nearby-events';
import { StartStepFunctionCommand } from '@holeshot/aws-commands/src';

import bootstrapper from './bootstrapper';
import { AddToScheduleCommand, AddToScheduleRequest } from '../commands/add-to-schedule';

const container = bootstrapper();

const addToSchedule = container.get<AddToScheduleCommand>("AddToScheduleCommand");

export interface AddToScheduleParams extends AddToScheduleRequest {
  connectionId: string // websocket connection ID added by run-lambda command
}

export const handler = async (params: AddToScheduleParams, context: Context) => {

  const response = await addToSchedule.runAsync(params);

  return {
    status_code: 200
  };
}
