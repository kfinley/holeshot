import { container } from './inversify.config';
import { bootstrapper as awsCommandsBootstrapper } from '@holeshot/aws-commands/src';


export default function bootstrapper() {

    // console.log('Bootstrapper', process.env.NODE_ENV);

    awsCommandsBootstrapper(container);

    // console.log("Bootstrapper Done");

    return container;
}

