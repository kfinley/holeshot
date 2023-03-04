import { Inject, injectable } from 'inversify-props';
import { Command } from '@holeshot/commands/src';
import {
  AttributeValue
} from "@aws-sdk/client-dynamodb";
import { GeoPoint, GeoDataManager, GeoDataManagerConfiguration } from 'dynamodb-geo-v3';

const AWS_REGION = process.env.AWS_REGION;

export interface PutPointRequest {
  tableName: string;
  indexName: string;
  hashKeyLength?: Number;
  rangeKeyValue: AttributeValue;
  geoPoint: GeoPoint;
  item: Record<string, AttributeValue> | undefined;
}

export interface PutPointResponse {
  $metadata: any;
}

@injectable()
export class PutPointCommand implements Command<PutPointRequest, PutPointResponse> {

  async runAsync(params: PutPointRequest): Promise<PutPointResponse> {

    const ddb = new DynamoDB({ region: AWS_REGION });

    const config = new GeoDataManagerConfiguration(ddb, request.tableName);

    config.geohashIndexName = request.indexName;
    config.hashKeyLength = request.hashKeyLength ?? 5;

    const myGeoTableManager = new GeoDataManager(config);

    const response = await myGeoTableManager.putPoint({
      RangeKeyValue: params.rangeKeyValue,
      GeoPoint: params.geoPoint,
      PutItemInput: {
        Item: params.item
      }
    });

    return {
      $metadata: response.$metadata
    };
  }
}
