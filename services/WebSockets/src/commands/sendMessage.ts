import { ApiGatewayManagementApi, ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';
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

  @Inject("ApiGatewayManagementApiClient")
  private client!: ApiGatewayManagementApiClient;

  async runAsync(params: SendMessageRequest): Promise<SendMessageResponse> {

    try {
      // console.log('connectionId', params.connectionId);
      // console.log('data', params.data);

      // this.client = container.get<ApiGatewayManagementApiClient>("ApiGatewayManagementApiClient");

      const output = await this.client.send(new PostToConnectionCommand({
        ConnectionId: params.connectionId,
        Data: params.data as any
      }));

      // console.log('output', output);

      return {
        statusCode: output.$metadata.httpStatusCode
      };
    } catch (e) {
      console.log('Error in sendMessageCommand', e);
      throw e;
    }
  }
}
