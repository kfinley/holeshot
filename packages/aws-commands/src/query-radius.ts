import { DynamoDB, QueryInput } from '@aws-sdk/client-dynamodb';
import { Command } from '@holeshot/commands/src';
import { GeoDataManager, GeoDataManagerConfiguration } from 'dynamodb-geo-v3';
import { GeoPoint, ItemList } from 'dynamodb-geo-v3/dist/types';
import { Container } from 'inversify-props';

export interface QueryRadiusRequest {
  container: Container;
  tableName: string;
  centerPoint: GeoPoint;
  distance?: number;
  hashKeyLength?: number;
};

export interface QueryRadiusResponse {
  items: ItemList;
}

export class QueryRadiusCommand implements Command<QueryRadiusRequest, QueryRadiusResponse> {

  private dynamoDB!: DynamoDB;

  async runAsync(params: QueryRadiusRequest): Promise<QueryRadiusResponse> {

    this.dynamoDB = params.container.get<DynamoDB>("DynamoDB");

    const config = new GeoDataManagerConfiguration(this.dynamoDB, params.tableName);
    config.hashKeyLength = params.hashKeyLength ?? 5;

    const myGeoTableManager = new GeoDataManager(config);

    const radius = 1609.344 * (params.distance ?? 500); // default to 500 miles. converted to meters.

    const items = await myGeoTableManager
      .queryRadius({
        RadiusInMeter: radius,
        CenterPoint: params.centerPoint
      });

    return {
      items
    };
  }

}


