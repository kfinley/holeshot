import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';
import { DynamoDB, DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { GeoDataManagerConfiguration, GeoDataManager } from 'dynamodb-geo-v3';

const TableName = process.env.HOLESHOT_CORE_TABLE as string;

// distance is km
var getBoundingBox = (lat, long, distance) => {
  var MIN_LAT, MAX_LAT, MIN_LON, MAX_LON, R, radDist, degLat, degLon, radLat, radLon, minLat, maxLat, minLon, maxLon, deltaLon;
  if (distance < 0) {
    return 'Illegal arguments';
  }
  // helper functions (degrees<?>radians)
  Number.prototype.degToRad = function () {
    return this * (Math.PI / 180);
  };
  Number.prototype.radToDeg = function () {
    return (180 * this) / Math.PI;
  };
  // coordinate limits
  MIN_LAT = (-90).degToRad();
  MAX_LAT = (90).degToRad();
  MIN_LON = (-180).degToRad();
  MAX_LON = (180).degToRad();
  // Earth's radius (km)
  R = 6378.1;
  // angular distance in radians on a great circle
  radDist = distance / R;
  // center point coordinates (deg)
  degLat = lat;
  degLon = long;
  // center point coordinates (rad)
  radLat = degLat.degToRad();
  radLon = degLon.degToRad();
  // minimum and maximum latitudes for given distance
  minLat = radLat - radDist;
  maxLat = radLat + radDist;
  // minimum and maximum longitudes for given distance
  minLon = void 0;
  maxLon = void 0;
  // define deltaLon to help determine min and max longitudes
  deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));
  if (minLat > MIN_LAT && maxLat < MAX_LAT) {
    minLon = radLon - deltaLon;
    maxLon = radLon + deltaLon;
    if (minLon < MIN_LON) {
      minLon = minLon + 2 * Math.PI;
    }
    if (maxLon > MAX_LON) {
      maxLon = maxLon - 2 * Math.PI;
    }
  }
  // a pole is within the given distance
  else {
    minLat = Math.max(minLat, MIN_LAT);
    maxLat = Math.min(maxLat, MAX_LAT);
    minLon = MIN_LON;
    maxLon = MAX_LON;
  }
  return [
    minLat.radToDeg(),
    minLon.radToDeg(),
    maxLat.radToDeg(),
    maxLon.radToDeg()
  ];
};

export type GetEventsNearbyRequest = {
  lat: string;
  long: string;
  date: string;
  distance: number;
}

export type GetEventsNearbyResponse = {
  events: Event[];
}


@injectable()
export class GetEventsNearby implements Command<GetEventsNearbyRequest, GetEventsNearbyResponse> {

  @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  async runAsync(params: GetEventsNearbyRequest): Promise<GetEventsNearbyResponse> {
    const ddb = new DynamoDB({ region: 'us-east-1' });
    
    const config = new GeoDataManagerConfiguration(ddb, "Holeshot-Geo");
    const myGeoTableManager = new GeoDataManager(config);

    const bbox = getBoundingBox(params.lat, params.long, params.distance * 1.6) // getBoundingBox expects kilometer so convert miles to km

    // const hashes = geohash.bboxes(bbox[0], bbox[1], bbox[2], bbox[3], 5) as string[];

    const event: Event[] = [];

    // for (const hash of hashes) {

    //   const query = {
    //     TableName,
    //     IndexName: "GSI1",
    //     ExpressionAttributeValues: marshall({
    //       ":GSI1PK": `${hash}`,
    //       ":GSI1SK": `${params.date}`
    //     }),
    //     KeyConditionExpression: "GSI1PK = :GSI1PK and GSI1SK >= :GSI1SK)",
    //   };

    //   const data = await this.ddbClient.send(new QueryCommand(query));


      // data.Items
    // }


    return {
      events: []
    }
  }
}

