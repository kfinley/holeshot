import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Event } from '@holeshot/types/src';
import { QueryRadiusCommand } from '@holeshot/aws-commands/src';
import { container } from '../inversify.config';

const TableName = process.env.HOLESHOT_CORE_TABLE as string;
const GeoTable = process.env.HOLESHOT_GEO_TABLE as string;

export type GetNearbyEventsRequest = {
  lat: number;
  long: number;
  date: string;
  distance?: number;
}

export type GetNearbyEventsResponse = {
  events: Event[] | Record<string, any>;
}

@injectable()
export class GetNearbyEventsCommand implements Command<GetNearbyEventsRequest, GetNearbyEventsResponse> {

  @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  @Inject("QueryRadiusCommand")
  private queryRadius!: QueryRadiusCommand;

  async runAsync(params: GetNearbyEventsRequest): Promise<GetNearbyEventsResponse> {

    const tracksInRange = await this.queryRadius.runAsync({
      container,
      tableName: GeoTable,
      centerPoint: {
        latitude: params.lat,
        longitude: params.long
      }
    });

    console.log('tracks', JSON.stringify(tracksInRange));
    const events: Record<string, any>[] = [];

    await Promise.all(tracksInRange.items.map(async item => {
      console.log('item', item);

      const query = {
        TableName,
        ExpressionAttributeValues: marshall({
          ":PK": `${item['name'].S}`,
          ":SK": `${params.date}`
        }),
        KeyConditionExpression: "PK = :PK and SK >= :SK",
      };

      console.log('query', JSON.stringify(query));

      const data = await this.ddbClient.send(new QueryCommand(query));
      console.log('items', data.Items);

      events.push(...data.Items.map(i => unmarshall(i)));
    }));

    console.log('Events', events)

    return {
      events
    }
  }
}

