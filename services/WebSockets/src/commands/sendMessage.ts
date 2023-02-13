import { ApiGatewayManagementApi, ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { Command } from '@holeshot/commands/src';
import { injectable } from 'inversify-props';
import { container } from '../inversify.config';

export interface SendMessageRequest {
  connectionId: string;
  data: string | undefined;
}

export interface SendMessageResponse {
  statusCode?: number
}

@injectable()
export class SendMessageCommand implements Command<SendMessageRequest, SendMessageResponse> {

  // @Inject("ApiGatewayManagementApiClient")
  private client!: ApiGatewayManagementApiClient;

  async runAsync(params: SendMessageRequest): Promise<SendMessageResponse> {

    try {
      console.log('connectionId', params.connectionId);
      console.log('data', params.data);

      try {

        const apigatewaymanagementapi = new ApiGatewayManagementApi({});
        //  console.log('endpoint', await apigatewaymanagementapi.config.endpoint());

        const output = await apigatewaymanagementapi.postToConnection({ ConnectionId: params.connectionId, Data: Buffer.from(params.data, 'base64') })

        console.log('output', output);
      } catch (e) {
        console.log('failed with ApiGatewayManagementApi', e);
      }

      this.client = container.get<ApiGatewayManagementApiClient>("ApiGatewayManagementApiClient");

      // This is a total hack because for some reason the hostname and path are losing values
      const { hostname, path } = await this.client.config.endpoint();

      this.client.middlewareStack.add(
        (next) =>
          async (args) => {
            const { request } = args as any

            console.log('args.request', request);

            if (request.hostname.indexOf(hostname.split('.')[0]) < 0) {
              request.hostname = hostname;
              request.path = path + request.path;
            }

            // args.request = request;

            console.log('args.request', args.request);

            return await next(args);
          },
        { step: "build" },
      );

      const output = await this.client.send(new PostToConnectionCommand({
        ConnectionId: params.connectionId,
        Data: params.data as any
      }));

      console.log('output', output);

      return {
        statusCode: output.$metadata.httpStatusCode
      };
    } catch (e) {
      console.log('Error in sendMessageCommand', e);
      throw e;
    }
  }
}
