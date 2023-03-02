import { Command } from '@holeshot/commands/src';
import { injectable } from 'inversify-props';
import { Lambda } from "@aws-sdk/client-lambda";

export type RunLambdaRequest = {
  name: string,
  payload: string,
};

export type RunLambdaResponse = {
  statusCode?: number
};

@injectable()
export class RunLambdaCommand implements Command<RunLambdaRequest, RunLambdaResponse> {

  private client!: Lambda;

  async runAsync(params: RunLambdaRequest): Promise<RunLambdaResponse> {

    console.log('run-lambda params', params);

    try {
      //TODO: fix this...
      this.client = new Lambda({
        region: 'us-east-1'
      });

      const command = {
        FunctionName: params.name,
        Payload: new TextEncoder().encode(JSON.stringify(params.payload))
      };

      const response = await this.client.invoke(command);
      console.log('response', JSON.stringify(response));

      return {
        statusCode: 200
      };
    } catch (e) {
      console.log('Error in sendMessageCommand', e);
      throw e;
    }
  }
}
