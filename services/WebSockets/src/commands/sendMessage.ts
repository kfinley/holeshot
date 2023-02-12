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

        const apigatewaymanagementapi = new ApiGatewayManagementApi({ apiVersion: '2018-11-29', endpoint: `https://ag49r7wqy7.execute-api.us-east-1.amazonaws.com/v1` });

        console.log('endpoint', apigatewaymanagementapi.config.endpoint);

        const output = await apigatewaymanagementapi.postToConnection({ ConnectionId: params.connectionId, Data: Buffer.from(params.data, 'base64') })

        console.log('output', output);
      } catch (e) {
        console.log('failed with ApiGatewayManagementApi', e);
      }

      this.client = container.get<ApiGatewayManagementApiClient>("ApiGatewayManagementApiClient");
      console.log('client.config.endpoint', await this.client.config.endpoint());

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
