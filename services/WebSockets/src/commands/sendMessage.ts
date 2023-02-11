import { ApiGatewayManagementApi, ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi';
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

const { APIGW_ENDPOINT } = process.env; //TODO ???

@injectable()
export class SendMessageCommand implements Command<SendMessageRequest, SendMessageResponse> {

  // @Inject("ApiGatewayManagementApiClient")
  private client!: ApiGatewayManagementApiClient;

  async runAsync(params: SendMessageRequest): Promise<SendMessageResponse> {

    console.log('connectionId', params.connectionId);
    console.log('data', params.data);

    const apiGateway = new ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint:
        `https://${APIGW_ENDPOINT}`,
    });

    // this.client = container.get<ApiGatewayManagementApiClient>("ApiGatewayManagementApiClient");
    // const output = await this.client.send(new PostToConnectionCommand({
    //   ConnectionId: params.connectionId,
    //   Data: params.data as any
    // }));

    console.log('sendMessage', params.data);

    const output = await apiGateway.postToConnection({
      ConnectionId: params.connectionId,
      Data: params.data as any
    });


    console.log('output', output);

    return {
      statusCode: output.$metadata.httpStatusCode
    };

  }
}
