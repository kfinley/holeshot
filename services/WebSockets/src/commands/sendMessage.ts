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
      console.log('client.config.endpoint', await this.client.config.endpoint());

      this.client.middlewareStack.add(
        (next) =>
          async (args) => {

            console.log('args.input', args.input);
            console.log('args.request', args.request);
            (args.request as any).hostname = 'ag49r7wqy7.' + (args.request as any).hostname;
            (args.request as any).path = '/v1' + (args.request as any).path;

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
