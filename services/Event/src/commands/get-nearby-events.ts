import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';
import { DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Event, Track } from '@holeshot/types/src';
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
  name?: string
}

export type GetNearbyEventsResponse = {
  // tracks: TrackInfo[] | Record<string, any>;
  searched: number;
  tracks: Track[] | Record<string, any>;
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
    const tracks: Record<string, any>[] = [];

    // const tracks: Record<string, any>[] = [];

    await Promise.all(tracksInRange.items.map(async item => {

      const expressionAttributeValues = {
        ":PK": `TRACK#${item['name'].S}`,
        ":startDate": `${params.startDate}`,
        ":endDate": `${params.endDate}`
      };

      console.log('expressionAttributeValues', expressionAttributeValues)
      if (params.type) {
        expressionAttributeValues[':type'] = params.type
      }

      if (params.name) {
        expressionAttributeValues[':name'] = params.name
      }

      const eventsQuery: QueryCommandInput = {
        TableName: CoreTable,
        ExpressionAttributeValues: marshall(expressionAttributeValues),
        KeyConditionExpression: "PK = :PK AND SK BETWEEN :startDate AND :endDate"
      };

      if (params.type) {
        eventsQuery.FilterExpression = "contains(eventType, :type)";
      }

      if (params.name) {
        eventsQuery.FilterExpression = eventsQuery.FilterExpression !== undefined ? eventsQuery.FilterExpression + ' AND ' : eventsQuery.FilterExpression;
        eventsQuery.FilterExpression = eventsQuery.FilterExpression + "contains(name, :name)";
      }

      const eventItems = await this.ddbClient.send(new QueryCommand(eventsQuery));

      console.log('eventItems', eventItems);

      eventItems.Items.map(i => {
        switch (i['type'].S) {
          case 'Event':
            const event = unmarshall(i);
            delete event.PK;
            delete event.SK;

            events.push(event);

            let track = tracks.find(t => t.name == event.trackName);
            if (track === undefined) {
              track = unmarshall(tracksInRange.items.find(t => unmarshall(t).name == event.trackName));
              console.log('track', track);
              tracks.push({
                name: track.name,
                location: track.location
              });
            }
            break;
          default:
            console.log('Unhandled type', unmarshall(i));
            break;
        }
      });
    }));

    return {
      searched: tracks.length,
      tracks,
      events
    }
  }
}
