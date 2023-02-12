import { container } from './inversify.config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi';
import { bootstrapper as awsCommandsBootstrapper } from '@holeshot/aws-commands/src';
import { AuthorizeConnectionCommand, DeleteConnectionByUserIdCommand, DeleteConnectionCommand, GetConnectionByUserIdCommand, SaveConnectionCommand, SendMessageCommand } from './commands';
import { IMessageCommand } from './commands/messageCommand';
import { PingMessageCommand } from './commands/pingMessage';

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

  if (!container.isBound("ApiGatewayManagementApiClient")) {

    container.bind<ApiGatewayManagementApiClient>("ApiGatewayManagementApiClient")
      .toDynamicValue(() => {

        const { APIGW_ENDPOINT } = process.env;
        console.log('APIGW_ENDPOINT', APIGW_ENDPOINT);

        const client = process.env.NODE_ENV === 'production'
          ?
          new ApiGatewayManagementApiClient({
            apiVersion: '2018-11-29',
            endpoint: `${APIGW_ENDPOINT}`
          }) // Prod
          :
          new ApiGatewayManagementApiClient({ // Local Dev
            endpoint: "http://kylefinley.sls:3001"
          });
          
          return client;
      }
      );
  }

  container.bind<AuthorizeConnectionCommand>("AuthorizeConnectionCommand").to(AuthorizeConnectionCommand);
  container.bind<DeleteConnectionCommand>("DeleteConnectionCommand").to(DeleteConnectionCommand);
  container.bind<DeleteConnectionByUserIdCommand>("DeleteConnectionByUserIdCommand").to(DeleteConnectionByUserIdCommand);
  container.bind<GetConnectionByUserIdCommand>("GetConnectionByUserIdCommand").to(GetConnectionByUserIdCommand);
  container.bind<SendMessageCommand>("SendMessageCommand").to(SendMessageCommand);
  container.bind<SaveConnectionCommand>("SaveConnectionCommand").to(SaveConnectionCommand);
  container.bind<IMessageCommand>("PingMessageCommand").to(PingMessageCommand);

  console.log("Bootstrapper Done");

  return container;
}

