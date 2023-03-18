import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { injectable, Inject } from "inversify-props";
import { Command } from "@holeshot/commands/src";
import { Track, Event } from "@holeshot/types/src";
import { marshall } from '@aws-sdk/util-dynamodb';

const TableName = process.env.HOLESHOT_CORE_TABLE as string;

export type AddToScheduleRequest = {
  username: string;
  track: Track;
  event: Event;
}

export type AddToScheduleResponse = {
  success: boolean;
}

@injectable()
export class AddToScheduleCommand implements Command<AddToScheduleRequest, AddToScheduleResponse> {

  @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  async runAsync(params: AddToScheduleRequest): Promise<AddToScheduleResponse> {
    console.log(params);

    var response = await this.ddbClient.send(new PutItemCommand({
      TableName,
      Item: {
        PK: {
          S: `USER#${params.username}#EVENT`
        },
        SK: {
          S: `${params.event.date}`
        },
        type: {
          S: 'UserEvent'
        },
        ...marshall({
          event: params.event,
          track: params.track
        })
      }
    }));

    return {
      success: response.$metadata.httpStatusCode == 200
    }
  }

}
