
import { SNSEvent, Context } from 'aws-lambda';

import bootstrapper from './bootstrapper';
import { SendPreviousEventsCommand } from '../commands/send-previous-events';
import { SendUpcomingEventsCommand } from '../commands/send-upcoming-events';

const container = bootstrapper();

const sendPrevious = container.get<SendPreviousEventsCommand>("GetPreviousEventsCommand");
const sendUpcoming = container.get<SendUpcomingEventsCommand>("GetUpcomingEventsCommand");

export const handler = async (event: SNSEvent, context: Context) => {

  console.log(event);

  const { userId, connectionId } = JSON.parse(event.Records[0].Sns.Message);

  const previous = sendPrevious.runAsync({
    userId,
    connectionId
  });

  const upcoming = sendUpcoming.runAsync({
    userId,
    connectionId
  });

  Promise.all([
    previous,
    upcoming
  ]);

  return {
    status_code: (await previous).success && (await previous).success ? 200 : 500
  };
}
