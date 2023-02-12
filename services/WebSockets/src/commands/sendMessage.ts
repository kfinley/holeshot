import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';

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

    console.log('connectionId', params.connectionId);
    console.log('data', params.data);
    console.log('client.config.endpoint', await this.client.config.endpoint());

    const output = await this.client.send(new PostToConnectionCommand({
      ConnectionId: params.connectionId,
      Data: params.data as any
    }));

    console.log('output', output);

    return {
      statusCode: output.$metadata.httpStatusCode
    };

  }
}
