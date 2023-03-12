import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';
import { DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Event, TrackInfo } from '@holeshot/types/src';
import { QueryRadiusCommand } from '@holeshot/aws-commands/src';
import { container } from '../inversify.config';

const CoreTable = process.env.HOLESHOT_CORE_TABLE as string;
const GeoTable = process.env.HOLESHOT_GEO_TABLE as string;

export type GetNearbyEventsRequest = {
  lat: number;
  long: number;
  startDate: string;
  endDate: string;
  distance?: number;
  type?: string;
}

export type GetNearbyEventsResponse = {
  // tracks: TrackInfo[] | Record<string, any>;
  trackCount: number;
  events: Event[] | Record<string, any>;
}

@injectable()
export class GetNearbyEventsCommand implements Command<GetNearbyEventsRequest, GetNearbyEventsResponse> {

  @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  @Inject("QueryRadiusCommand")
  private queryRadius!: QueryRadiusCommand;

  async runAsync(params: GetNearbyEventsRequest): Promise<GetNearbyEventsResponse> {

    console.log('parms', JSON.stringify(params));

    const tracksInRange = await this.queryRadius.runAsync({
      container,
      tableName: GeoTable,
      centerPoint: {
        latitude: params.lat,
        longitude: params.long
      },
      distance: params.distance
    });

    console.log('tracks', tracksInRange.items.length);

    const events: Record<string, any>[] = [];
    // const tracks: Record<string, any>[] = [];

    await Promise.all(tracksInRange.items.map(async item => {

      const expressionAttributeValues = {
        ":PK": `TRACK#${item['name'].S}`,
        ":startDate": `${params.startDate}`,
        ":endDate": `${params.endDate}`
      };

      if (params.type) {
        expressionAttributeValues[':type'] = params.type
      }

      const eventsQuery: QueryCommandInput = {
        TableName: CoreTable,
        ExpressionAttributeValues: marshall(expressionAttributeValues),
        KeyConditionExpression: "PK = :PK and SK BETWEEN :startDate AND :endDate"
      };

      if (params.type) {
        eventsQuery.FilterExpression = "contains(eventType, :type)";
      }

      const eventItems = await this.ddbClient.send(new QueryCommand(eventsQuery));

      eventItems.Items.map(i => {
        switch (i['type'].S) {
          case 'Track':
            // tracks.push(unmarshall(i));
            break;
          case 'Event':
            const event = unmarshall(i);
            delete event.PK;
            delete event.SK;

            events.push(event)
            break;
          default:
            console.log('Unknown type', unmarshall(i));
            break;
        }
      });
    }));

    return {
      trackCount: tracksInRange.items.length,
      events
    }
  }
}
