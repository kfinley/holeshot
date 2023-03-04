
import { DynamoDB, DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { TrackInfo } from '@holeshot/types/src';
import { Command } from '@holeshot/commands/src';
import { GetStoredObjectCommand, PutPointCommand } from '@holeshot/aws-commands/src'
import { Inject, injectable } from 'inversify-props';
import { convertTrackInfoToItem } from './ddb-helpers';
import { container } from './inversify.config';

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

  @Inject("PutPointCommand")
  private putPointCommand!: PutPointCommand;

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

    const response = await this.putPointCommand({
      tableName: TableName,
      indexName: 'geohash-index',
      hashKeyLength: 5,
      rangeKeyValue: { S: trackInfo.name },
      geoPoint: {
        latitude: +trackInfo.location.gps.lat,
        longitude: +trackInfo.location.gps.long
      },
      item: trackItem
    });

    items.push(response.$metadata.httpStatusCode);

    console.log('items', JSON.stringify(items));

    return {
      success: true
    }
  }
}
