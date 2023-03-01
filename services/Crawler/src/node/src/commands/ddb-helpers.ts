import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { TrackInfo, Event } from "@holeshot/types/src";
import geohash from 'ngeohash';

export function convertTrackInfoToItem(track: TrackInfo): {
  [key: string]: AttributeValue;
} | undefined {

  // const optionalAttributes = convertUserOptionalAttributesToItem(user);

  const created = new Date().toISOString();

  return {
    PK: {
      S: `TRACK#${track.name}`
    },
    SK: {
      S: `TRACK#${track.name}`
    },
    type: {
      S: 'Track'
    },
    created: {
      S: created
    },
    ...marshall(track)
  }
}

export function convertEventToItem(event: Event, track: TrackInfo): {
  [key: string]: AttributeValue;
} | undefined {

  const created = new Date().toISOString();

  return {
    PK: {
      S: `TRACK#${track.name}`
    },
    SK: {
      S: `${event.date}`
    },
    GSI1PK: {
      S: geohash.encode(track.location.gps.lat, track.location.gps.long)
    },
    GSI1SK: {
      S: `${event.date}`
    },
    type: {
      S: 'Event'
    },
    created: {
      S: created
    },
    ...marshall(event)
  }
}

export function convert(trackInfo: TrackInfo) {
  return {
    ...marshall(trackInfo)
  }
}
