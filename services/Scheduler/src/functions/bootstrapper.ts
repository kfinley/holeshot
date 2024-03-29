import { container } from './../inversify.config';
import { bootstrapper as awsCommandsBootstrapper } from '@holeshot/aws-commands/src';
import { GetNearbyEventsCommand } from './../commands/get-nearby-events';
import { SendPreviousEventsCommand } from '../commands/send-previous-events';
import { SendUpcomingEventsCommand } from '../commands/send-upcoming-events';
import { SendRaceLogsCommand } from '../commands/send-race-logs';

export default function bootstrapper() {

  // console.log('Bootstrapper', process.env.NODE_ENV);

  awsCommandsBootstrapper(container);

  container.bind<GetNearbyEventsCommand>("GetNearbyEventsCommand").to(GetNearbyEventsCommand);
  container.bind<SendPreviousEventsCommand>("SendPreviousEventsCommand").to(SendPreviousEventsCommand);
  container.bind<SendUpcomingEventsCommand>("SendUpcomingEventsCommand").to(SendUpcomingEventsCommand);
  container.bind<SendRaceLogsCommand>("SendRaceLogsCommand").to(SendRaceLogsCommand);
  
  // console.log("Bootstrapper Done");

  return container;
}
