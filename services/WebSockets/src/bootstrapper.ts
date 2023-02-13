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

        const { APIGW_ENDPOINT, NODE_ENV } = process.env;

        const client = NODE_ENV === 'production'
          ?
          new ApiGatewayManagementApiClient({
            endpoint: `https://${APIGW_ENDPOINT}`
          }) // Prod
          :
          new ApiGatewayManagementApiClient({ // Local Dev
            endpoint: "http://kylefinley.sls:3001"
          });

        //HACK: For some reason the hostname and path values are changing.
        // similar to what's mentioned in closed ticket: https://github.com/aws/aws-sdk-js-v3/issues/1830
        // Looks like a bug was introduced into smithy-client.. maybe when resolve-path.ts was introduced
        client.middlewareStack.add(
          (next) =>
            async (args) => {
              const { hostname, path } = await client.config.endpoint();
              const { request } = args as any

              if (request.hostname.indexOf(hostname.split('.')[0]) < 0) {
                // console.log('ApiGatewayManagementApiClient middleware hack: rewriting args.request:', request);
                request.hostname = hostname;
                request.path = path + request.path;
                // console.log('args.request', args.request);

              } else {
                console.log('ALERT!!! ApiGatewayManagementApiClient middleware hack may no longer be needed.');
              }

              return await next(args);
            },
          { step: "build" },
        );
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

