import { container } from './inversify.config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi';
import { bootstrapper as awsCommandsBootstrapper } from '@holeshot/aws-commands/src';
import { AuthorizeConnectionCommand, DeleteConnectionByUserIdCommand, DeleteConnectionCommand, GetConnectionByUserIdCommand, SaveConnectionCommand, SendMessageCommand } from './commands';
import { IMessageCommand } from './commands/messageCommand';
import { PingMessageCommand } from './commands/pingMessage';

const { APIGW_ENDPOINT } = process.env; //TODO ???

export default function bootstrapper() {

  console.log('Bootstrapper', process.env.NODE_ENV);
  console.log('APIGW_ENDPOINT', APIGW_ENDPOINT);

  const endpoint = APIGW_ENDPOINT.split('/');

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
      .toDynamicValue(() => process.env.NODE_ENV === 'production'
        ?
        new ApiGatewayManagementApiClient({
          // endpoint: `${APIGW_ENDPOINT}`,
          endpoint: {
            protocol: "https",
            hostname: endpoint[0],
            path: `/${endpoint[1]}`
          },
        }) // Prod
        :
        new ApiGatewayManagementApiClient({ // Local Dev
          endpoint: "http://kylefinley.sls:3001"
        }));
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

