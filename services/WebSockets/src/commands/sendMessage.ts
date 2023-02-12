import { ApiGatewayManagementApi, ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
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

    try {
      console.log('connectionId', params.connectionId);
      console.log('data', params.data);
      console.log('client.config.endpoint', await this.client.config.endpoint());

      const apigatewaymanagementapi = new ApiGatewayManagementApi({ apiVersion: '2018-11-29', endpoint: `https://ag49r7wqy7.execute-api.us-east-1.amazonaws.com/v1` });

      let output: any = {};
      apigatewaymanagementapi.postToConnection({ ConnectionId: params.connectionId, Data: Buffer.from(params.data, 'base64') })
        .then(out => {
          output = {
            statusCode: out.$metadata.httpStatusCode
          };
        })
        .catch(error => {
          console.log('Error posting to connection', error);
          throw error;
        });

      // const output = await this.client.send(new PostToConnectionCommand({
      //   ConnectionId: params.connectionId,
      //   Data: params.data as any
      // }));

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
