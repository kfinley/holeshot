
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { Inject, injectable } from 'inversify-props';
import { Event, TrackInfo } from '@holeshot/types/src';
import { Command } from '@holeshot/commands/src';
import { GetStoredObjectCommand } from '@holeshot/aws-commands/src'
import { convertEventToItem } from './ddb-helpers';
import { container } from './../commands/inversify.config';

const TableName = process.env.HOLESHOT_CORE_TABLE as string;
const bucketName = process.env.BUCKET_NAME as string;

export type SaveTrackEventsCommandRequest = {
  key: string
}

export type SaveTrackEventsCommandResponse = {
  success: boolean;
}

@injectable()
export class SaveTrackEventsCommand implements Command<SaveTrackEventsCommandRequest, SaveTrackEventsCommandResponse> {

  @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  @Inject("GetStoredObjectCommand")
  private getStoredObjectCommand!: GetStoredObjectCommand;

  async runAsync(params: SaveTrackEventsCommandRequest): Promise<SaveTrackEventsCommandResponse> {

    const items: any[] = [];

    const getTrackEvents = await this.getStoredObjectCommand.runAsync({
      container,
      bucket: bucketName,
      key: params.key
    });

    const trackEvents = JSON.parse(getTrackEvents.body) as { track: TrackInfo, events: Event[] };

    await Promise.all(trackEvents.events.map(async event => {

      var response = await this.ddbClient.send(new PutItemCommand({
        TableName,
        Item: convertEventToItem(event, trackEvents.track)
      }));

      items.push(response.$metadata.httpStatusCode);

    }));

    console.log('items', JSON.stringify(items));

    return {
      success: true
    }
  }
}
