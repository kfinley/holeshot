import { container } from './inversify.config';
import { bootstrapper as awsCommandsBootstrapper } from '@holeshot/aws-commands/src';
import { SaveTrackInfoCommand, } from './save-track-info';
import { SaveTrackEventsCommand } from './save-track-events';


export default function bootstrapper() {

  // console.log('Bootstrapper', process.env.NODE_ENV);

  awsCommandsBootstrapper(container);

  container.bind<SaveTrackInfoCommand>("SaveTrackInfoCommand").to(SaveTrackInfoCommand);
  container.bind<SaveTrackEventsCommand>('SaveTrackEventsCommand').to(SaveTrackEventsCommand);

  // console.log("Bootstrapper Done");

  return container;
}

