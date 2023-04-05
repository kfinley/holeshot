import { SNSEvent, Context } from 'aws-lambda';

import bootstrapper from './bootstrapper';
import { SendPreviousEventsCommand } from '../commands/send-previous-events';
import { SendUpcomingEventsCommand } from '../commands/send-upcoming-events';
import { SendRaceLogsCommand } from '../commands/send-race-logs';

const container = bootstrapper();

const sendPrevious = container.get<SendPreviousEventsCommand>("SendPreviousEventsCommand");
const sendUpcoming = container.get<SendUpcomingEventsCommand>("SendUpcomingEventsCommand");
const sendRaceLogs = container.get<SendRaceLogsCommand>("SendRaceLogsCommand");

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

  const logs = sendRaceLogs.runAsync({
    userId,
    connectionId
  });

  Promise.all([
    previous,
    upcoming,
    logs
  ]);

  return {
    status_code: (await previous).success && (await previous).success ? 200 : 500
  };
}
