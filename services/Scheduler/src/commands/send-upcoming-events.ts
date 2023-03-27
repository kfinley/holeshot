import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';
import { container } from '../inversify.config';
import { GetEntitiesCommand, StartStepFunctionCommand } from '@holeshot/aws-commands/src';
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { ServiceActions } from "@holeshot/types/src/service-actions";

export type SendUpcomingEventsRequest = {
  userId: string;
  connectionId: string;
}

export type SendUpcomingEventsResponse = {
  success: boolean;
}

@injectable()
export class SendUpcomingEventsCommand implements Command<SendUpcomingEventsRequest, SendUpcomingEventsResponse> {

  @Inject("GetEntitiesCommand")
  private getEntities!: GetEntitiesCommand;

  @Inject("StartStepFunctionCommand")
  private startStepFunction!: StartStepFunctionCommand;

  async runAsync(params: SendUpcomingEventsRequest): Promise<SendUpcomingEventsResponse> {
    const today = new Date(new Date().setHours(0, 0, 0, 0)).toJSON();

    const response = await this.getEntities.runAsync({
      keyConditionExpression: "PK = :PK AND SK >= :today",
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
        subject: `Scheduler/${ServiceActions.Scheduler.setUpcoming}`, // Store module/action
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
