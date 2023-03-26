import { container } from './../inversify.config';
import { bootstrapper as awsCommandsBootstrapper } from '@holeshot/aws-commands/src';
import { GetNearbyEventsCommand } from './../commands/get-nearby-events';

export default function bootstrapper() {

  // console.log('Bootstrapper', process.env.NODE_ENV);

  awsCommandsBootstrapper(container);

  container.bind<GetNearbyEventsCommand>("GetNearbyEventsCommand").to(GetNearbyEventsCommand);

  // console.log("Bootstrapper Done");

  return container;
}
