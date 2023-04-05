import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';
import { container } from '../inversify.config';
import { GetEntitiesCommand, StartStepFunctionCommand } from '@holeshot/aws-commands/src';
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { Actions } from '@holeshot/types/src/actions';

export type SendRaceLogsRequest = {
  userId: string;
  connectionId: string;
}

export type SendRaceLogsResponse = {
  success: boolean;
}

@injectable()
export class SendRaceLogsCommand implements Command<SendRaceLogsRequest, SendRaceLogsResponse> {

  @Inject("GetEntitiesCommand")
  private getEntities!: GetEntitiesCommand;

  @Inject("StartStepFunctionCommand")
  private startStepFunction!: StartStepFunctionCommand;

  async runAsync(params: SendRaceLogsRequest): Promise<SendRaceLogsResponse> {
    const today = new Date(new Date().setHours(-7, 0, 0, 0))
      .toJSON()
      .replace(".000Z", "");

    const logs = [];

    const response = await this.getEntities.runAsync({
      keyConditionExpression: "PK = :PK AND SK <= :today",
      expressionAttributeValues: {
        ":PK": `USER#${params.userId}#RACELOG`,
        ":today": today,
      },
      container
    });

    response.items.map( i => {
      const log = unmarshall(i);
      delete log["PK"];
      delete log["SK"];
      delete log["type"];
      logs.push(log);
    });

    const startStepFunctionResponse = await this.startStepFunction.runAsync({
      input: JSON.stringify({
        subject: `RaceLogs/${Actions.RaceLogs.setLogs}`, // Store module/action
        connectionId: params.connectionId,
        message: JSON.stringify({
          logs
        })
      }),
      stateMachineName: 'Holeshot-WebSockets-SendMessage',
      container
    });

    return {
      success: startStepFunctionResponse.statusCode == 200
    };
  }
} 
