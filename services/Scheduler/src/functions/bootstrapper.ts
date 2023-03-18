import { container } from './../inversify.config';
import { bootstrapper as awsCommandsBootstrapper } from '@holeshot/aws-commands/src';
import { GetNearbyEventsCommand } from './../commands/get-nearby-events';
import { AddEntityCommand } from '../commands/add-entity';

export default function bootstrapper() {

  console.log('Bootstrapper', process.env.NODE_ENV);

  awsCommandsBootstrapper(container);

  container.bind<GetNearbyEventsCommand>("GetNearbyEventsCommand").to(GetNearbyEventsCommand);
  container.bind<AddEntityCommand>("AddEntityCommand").to(AddEntityCommand);
  
  console.log("Bootstrapper Done");

  return container;
}
