import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';
import { container } from '../inversify.config';
import { GetEntitiesCommand, StartStepFunctionCommand } from '@holeshot/aws-commands/src';
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { Actions } from '@holeshot/types/src/actions';

export type SendPreviousEventsRequest = {
  userId: string;
  connectionId: string;
}

export type SendPreviousEventsResponse = {
  success: boolean;
}

@injectable()
export class SendPreviousEventsCommand implements Command<SendPreviousEventsRequest, SendPreviousEventsResponse> {

  @Inject("GetEntitiesCommand")
  private getEntities!: GetEntitiesCommand;

  @Inject("StartStepFunctionCommand")
  private startStepFunction!: StartStepFunctionCommand;

  async runAsync(params: SendPreviousEventsRequest): Promise<SendPreviousEventsResponse> {
    const today = new Date(new Date().setHours(-7, 0, 0, 0))
      .toJSON()
      .replace(".000Z", "")

    console.log(today);

    const response = await this.getEntities.runAsync({
      keyConditionExpression: "PK = :PK AND SK < :today",
      expressionAttributeValues: {
        ":PK": `USER#${params.userId}#EVENT`,
        ":today": today,
      },
      container
    });

    //  console.log('getEntities.Items', response.items);

    const schedule = [];

    response.items.map(i => {
      const event = unmarshall(i);
      delete event["PK"];
      delete event["SK"];
      delete event["type"];

      //console.log('event', event);

      schedule.push(event);
    });

    const startStepFunctionResponse = await this.startStepFunction.runAsync({
      input: JSON.stringify({
        subject: `Scheduler/${Actions.Scheduler.setPrevious}`, // Store module/action
        connectionId: params.connectionId,
        message: JSON.stringify({
          schedule
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
