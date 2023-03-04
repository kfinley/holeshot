
import { DynamoDB, DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { Inject, injectable } from 'inversify-props';
import { Event, TrackInfo } from '@holeshot/types/src';
import { Command } from '@holeshot/commands/src';
import { GetStoredObjectCommand } from '@holeshot/aws-commands/src/getStoredObject'
import { convertEventToItem } from './ddb-helpers';
import { container } from './../commands/inversify.config';
import { GeoDataManager, GeoDataManagerConfiguration } from 'dynamodb-geo-v3';

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

      const ddb = new DynamoDB({ region: 'us-east-1' });
      const config = new GeoDataManagerConfiguration(ddb, "Holeshot-Core");
      config.geohashIndexName = 'geohash-index';
      config.hashKeyLength = 5

      const myGeoTableManager = new GeoDataManager(config);
      const response = await myGeoTableManager.putPoint({
        RangeKeyValue: { S: event.date.toString() },
        GeoPoint: {
          latitude: +trackEvents.track.location.gps.lat,
          longitude: +trackEvents.track.location.gps.long
        },
        PutItemInput: {
          Item: eventItem
        }
      })
      
      // var response = await this.ddbClient.send(new PutItemCommand({
      //   TableName,
      //   Item: eventItem
      // }));

      console.log('response', JSON.stringify(response));
      items.push(response.$metadata.httpStatusCode);

    };

    console.log('items', JSON.stringify(items));

    return {
      success: true
    }
  }
}
