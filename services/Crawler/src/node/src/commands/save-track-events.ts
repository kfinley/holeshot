
import { DynamoDB, DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { Inject, injectable } from 'inversify-props';
import { Event, TrackInfo } from '@holeshot/types/src';
import { Command } from '@holeshot/commands/src';
import { GetStoredObjectCommand, PutPointCommand } from '@holeshot/aws-commands/src'
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

  @Inject("PutPointCommand")
  private putPointCommand!: PutPointCommand;

  async runAsync(params: SaveTrackEventsCommandRequest): Promise<SaveTrackEventsCommandResponse> {

    console.log('params', params);
    const items: any[] = [];
    console.log('key', params.key);

    console.log(`Key: ${params.key} BucketName: ${bucketName}`);

    var getTrackEvents = await this.getStoredObjectCommand.runAsync({
      container,
      bucket: bucketName,
      key: params.key
    });

    var trackEvents = JSON.parse(getTrackEvents.body) as { track: TrackInfo, events: Event[] };

    for await (const event of trackEvents.events) {

      const eventItem = convertEventToItem(event, trackEvents.track);

      console.log('eventItem', eventItem);

      const response = await this.putPointCommand({
        tableName: TableName,
        indexName: 'geohash-index',
        hashKeyLength: 5,
        rangeKeyValue: { S: event.date.toString() },
        geoPoint: {
          latitude: +trackEvents.track.location.gps.lat,
          longitude: +trackEvents.track.location.gps.long
        },
        item: eventItem
      });

      console.log('response', JSON.stringify(response));
      items.push(response.$metadata.httpStatusCode);

    };

    console.log('items', JSON.stringify(items));

    return {
      success: true
    }
  }
}
