import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi';
import { PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
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

    console.log('connectionId', params.connectionId);
    console.log('data', params.data);
    
    this.client = container.get<ApiGatewayManagementApiClient>("ApiGatewayManagementApiClient");

    console.log('sendMessage', params.data);

    const output = await this.client.send(new PostToConnectionCommand({
      ConnectionId: params.connectionId,
      Data: params.data as any
    }));

    return {
      statusCode: output.$metadata.httpStatusCode
    };

  }
}
