import { container } from './inversify.config';
import { bootstrapper as awsCommandsBootstrapper } from '@holeshot/aws-commands/src';
import { GetUserCommand, } from './commands/get-user';
import { CreateCognitoUserCommand } from './commands/create-cognito-user';
import { SendConfirmationCommand } from './commands/sendRegistrationConfirmation';
import { SaveUserCommand } from './commands/save-user';

export default function bootstrapper() {

  console.log('Bootstrapper', process.env.NODE_ENV);

  awsCommandsBootstrapper(container);

  container.bind<GetUserCommand>("GetUserCommand").to(GetUserCommand);
  container.bind<CreateCognitoUserCommand>("CreateCognitoUserCommand").to(CreateCognitoUserCommand);
  container.bind<SaveUserCommand>("SaveUserCommand").to(SaveUserCommand);
  container.bind<SendConfirmationCommand>("SendConfirmationCommand").to(SendConfirmationCommand);

  console.log("Bootstrapper Done");

  return container;
}

