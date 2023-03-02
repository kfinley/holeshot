import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';
import { DynamoDB, DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { GeoDataManagerConfiguration, GeoDataManager } from 'dynamodb-geo-v3';
import { Event } from '@holeshot/types/src';

const TableName = process.env.HOLESHOT_CORE_TABLE as string;

export type GetEventsNearbyRequest = {
  lat: number;
  long: number;
  date: string;
  distance?: number;
}

export type GetEventsNearbyResponse = {
  events: Event[] | Record<string, any>;
}

@injectable()
export class GetEventsNearby implements Command<GetEventsNearbyRequest, GetEventsNearbyResponse> {

  @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  async runAsync(params: GetEventsNearbyRequest): Promise<GetEventsNearbyResponse> {
    const ddb = new DynamoDB({ region: 'us-east-1' });

    const config = new GeoDataManagerConfiguration(ddb, "Holeshot-Geo");
    const myGeoTableManager = new GeoDataManager(config);

    const radius = 1609.344 * params.distance ?? 500; // default to 500 miles. converted to meters.

    const trackInRange = await myGeoTableManager
      .queryRadius({
        RadiusInMeter: radius,
        CenterPoint: {
          latitude: params.lat,
          longitude: params.long,
        },
      });

    const events: Record<string, any>[] = [];

    const promises = trackInRange.map(async item => {
      console.log('item', item);

      const query = {
        TableName,
        ExpressionAttributeValues: marshall({
          ":PK": `${item['name'].S}`,
          ":SK": `${params.date}`
        }),
        KeyConditionExpression: "PK = :PK and SK >= :SK)",
      };

      const data = await this.ddbClient.send(new QueryCommand(query));
      console.log('items', data.Items);

      events.push(...data.Items.map(i => unmarshall(i)));
    });

    await Promise.all(promises);

    console.log('Events', events)

    return {
      events
    }
  }
}

