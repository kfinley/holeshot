import { container } from './inversify.config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { bootstrapper as awsCommandsBootstrapper } from '@holeshot/aws-commands/src';
import { AuthorizeConnectionCommand, DeleteConnectionByUserIdCommand, DeleteConnectionCommand, GetConnectionByUserIdCommand, SaveConnectionCommand, SendMessageCommand } from './commands';
import { IMessageCommand } from './commands/messageCommand';

export default function bootstrapper() {

    console.log('Bootstrapper', process.env.NODE_ENV);

    awsCommandsBootstrapper(container);

    if (!container.isBound("DynamoDBClient")) {
        container.bind<DynamoDBClient>("DynamoDBClient")
            .toDynamicValue(() =>
                process.env.NODE_ENV === 'production'
                    ?
                    new DynamoDBClient({}) // Prod
                    :
                    new DynamoDBClient({ // Local Dev
                        endpoint: "http://Holeshot.dynamodb:8000"
                    }));
    }

    container.bind<AuthorizeConnectionCommand>("AuthorizeConnectionCommand").to(AuthorizeConnectionCommand);
    container.bind<DeleteConnectionCommand>("DeleteConnectionCommand").to(DeleteConnectionCommand);
    container.bind<DeleteConnectionByUserIdCommand>("DeleteConnectionByUserIdCommand").to(DeleteConnectionByUserIdCommand);
    container.bind<GetConnectionByUserIdCommand>("GetConnectionByUserIdCommand").to(GetConnectionByUserIdCommand);
    container.bind<SendMessageCommand>("SendMessageCommand").to(SendMessageCommand);
    container.bind<SaveConnectionCommand>("SaveConnectionCommand").to(SaveConnectionCommand);

    console.log("Bootstrapper Done");

    return container;
}

