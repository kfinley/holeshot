import { Command } from '@holeshot/commands/src';
import { injectable } from 'inversify-props';
import { Lambda } from "@aws-sdk/client-lambda";

export type RunLambdaRequest = {
  name: string;
  payload: string;
};

export type RunLambdaResponse = {
  statusCode?: number;
};

const AWS_REGION = process.env.AWS_REGION;

@injectable()
export class RunLambdaCommand implements Command<RunLambdaRequest, RunLambdaResponse> {

  private client!: Lambda;

  async runAsync(params: RunLambdaRequest): Promise<RunLambdaResponse> {

    try {
      //TODO: fix this...
      this.client = new Lambda({
        region: AWS_REGION
      });

      const command = {
        FunctionName: params.name,
        InvocationType: "Event",  // Run as Event will kick off lambda and receive a 202 response.
        Payload: new TextEncoder().encode(params.payload)
      };

      const response = await this.client.invoke(command);

      return {
        statusCode: 200
      };
    } catch (e) {
      console.log('Error in sendMessageCommand', e);
      throw e;
    }
  }
}
