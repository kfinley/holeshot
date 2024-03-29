import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { TrackInfo } from '@holeshot/types/src';
import { Command } from '@holeshot/commands/src';
import { GetStoredObjectCommand, PutPointCommand } from '@holeshot/aws-commands/src'
import { Inject, injectable } from 'inversify-props';
import { convertTrackInfoToItem } from './ddb-helpers';
import { container } from './inversify.config';
import { marshall } from '@aws-sdk/util-dynamodb';

const TableName = process.env.HOLESHOT_CORE_TABLE as string;
const GeoTable = process.env.HOLESHOT_GEO_TABLE as string;
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

    var getTrackInfo = await this.getStoredObjectCommand.runAsync({
      container,
      bucket: bucketName,
      key: params.key
    });

    var trackInfo = JSON.parse(getTrackInfo.body) as TrackInfo;

    const trackItem = convertTrackInfoToItem(trackInfo);

    var coreResponse = await this.ddbClient.send(new PutItemCommand({
      TableName,
      Item: trackItem
    }));

    const geoResponse = await this.putPointCommand.runAsync({
      container,
      tableName: GeoTable,
      rangeKeyValue: { S: trackInfo.name },
      geoPoint: {
        latitude: +trackInfo.location.gps.lat,
        longitude: +trackInfo.location.gps.long
      },
      item: marshall({
        name: trackInfo.name,
        location: trackInfo.location,
        contactInfo: trackInfo.contactInfo,
        district: trackInfo.district,
        website: trackInfo.website
      })
    });

    console.log('items', { core: coreResponse.$metadata.httpStatusCode, geo: geoResponse.$metadata.httpStatusCode });

    return {
      success: true
    }
  }
}
