
import { DynamoDB, DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { TrackInfo } from '@holeshot/types/src';
import { Command } from '@holeshot/commands/src';
import { GetStoredObjectCommand } from '@holeshot/aws-commands/src/getStoredObject'
import { Inject, injectable } from 'inversify-props';
import { convertTrackInfoToItem } from './ddb-helpers';
import { container } from './inversify.config';
import { GeoDataManagerConfiguration, GeoDataManager } from 'dynamodb-geo-v3';


const TableName = process.env.HOLESHOT_CORE_TABLE as string;
const bucketName = process.env.BUCKET_NAME as string;

export type SaveTrackInfoCommandRequest = {
  key: string
}

export type SaveTrackInfoCommandResponse = {
  success: boolean;
}

@injectable()
export class SaveTrackInfoCommand implements Command<SaveTrackInfoCommandRequest, SaveTrackInfoCommandResponse> {

  @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  @Inject("GetStoredObjectCommand")
  private getStoredObjectCommand!: GetStoredObjectCommand;

  async runAsync(params: SaveTrackInfoCommandRequest): Promise<SaveTrackInfoCommandResponse> {

    // console.log('params', params);
    const items: any[] = [];

    console.log(`Key: ${params.key} BucketName: ${bucketName}`);

    var getTrackInfo = await this.getStoredObjectCommand.runAsync({
      container,
      bucket: bucketName,
      key: params.key
    });

    var trackInfo = JSON.parse(getTrackInfo.body) as TrackInfo;

    const trackItem = convertTrackInfoToItem(trackInfo);

    console.log('trackItem', JSON.stringify(trackItem));

    var coreResponse = await this.ddbClient.send(new PutItemCommand({
      TableName,
      Item: trackItem
    }));

    const ddb = new DynamoDB({ region: 'us-east-1' });
    const config = new GeoDataManagerConfiguration(ddb, "Holeshot-Geo");
    config.hashKeyLength = 5

    const myGeoTableManager = new GeoDataManager(config);
    const geoResponse = await myGeoTableManager.putPoint({
      RangeKeyValue: { S: trackInfo.name },
      GeoPoint: {
        latitude: +trackInfo.location.gps.lat,
        longitude: +trackInfo.location.gps.long
      },
      PutItemInput: {
        Item: trackItem
      }
    })

    items.push({ core: coreResponse.$metadata.httpStatusCode, geo: geoResponse.$metadata.httpStatusCode });

    console.log('items', JSON.stringify(items));

    return {
      success: true
    }
  }
}
