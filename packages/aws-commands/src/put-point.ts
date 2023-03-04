import { injectable, Container } from 'inversify-props';
import { Command } from '@holeshot/commands/src';
import {
  AttributeValue,
  DynamoDB
} from "@aws-sdk/client-dynamodb";
import { GeoDataManager, GeoDataManagerConfiguration } from 'dynamodb-geo-v3';
import { GeoPoint } from 'dynamodb-geo-v3/dist/types';

export interface PutPointRequest {
  tableName: string;
  hashKeyLength?: number;
  rangeKeyValue: AttributeValue;
  geoPoint: GeoPoint;
  item: Record<string, AttributeValue> | undefined;
  container: Container;
}

export interface PutPointResponse {
  $metadata: any;
}

@injectable()
export class PutPointCommand implements Command<PutPointRequest, PutPointResponse> {

  private dynamoDB!: DynamoDB;

  async runAsync(params: PutPointRequest): Promise<PutPointResponse> {

    this.dynamoDB = params.container.get<DynamoDB>("DynamoDB");

    const config = new GeoDataManagerConfiguration(this.dynamoDB, params.tableName);
    config.hashKeyLength = params.hashKeyLength ?? 5;

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
