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

const AWS_REGION = process.env.AWS_REGION;

@injectable()
export class RunLambdaCommand implements Command<RunLambdaRequest, RunLambdaResponse> {

  private client!: Lambda;

  async runAsync(params: RunLambdaRequest): Promise<RunLambdaResponse> {

    console.log('run-lambda params', params);

    try {
      //TODO: fix this...
      this.client = new Lambda({
        region: AWS_REGION
      });

      const command = {
        FunctionName: params.name,
        InvocationType: "Event",  // ??
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
