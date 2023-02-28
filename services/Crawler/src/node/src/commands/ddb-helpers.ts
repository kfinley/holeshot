import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { TrackInfo, Event } from "@holeshot/types/src";

export function convertTrackInfoToItem(ownerId: string, track: TrackInfo): {
  [key: string]: AttributeValue;
} | undefined {

  // const optionalAttributes = convertUserOptionalAttributesToItem(user);

  const created = new Date().toISOString();

  return {
    PK: {
      S: `OWNER#${ownerId}`
    },
    SK: {
      S: `TRACK#${track.name}`
    },
    GSI1SK: {
      S: `CREATED_CREATED_DATE#${created}`
    },
    type: {
      S: 'Track'
    },
    ...marshall(track)
  }
}

export function convertEventToItem(ownerId: string, event: Event): {
  [key: string]: AttributeValue;
} | undefined {

  const created = new Date().toISOString();

  return {
    PK: {
      S: `OWNER#${ownerId}`
    },
    SK: {
      S: `EVENT#${event.name}`
    },
    GSI1SK: {
      S: `DATE#${event.date}`
    },
    type: {
      S: 'Event'
    },
    ...marshall(event)
  }
}

export function convert(trackInfo: TrackInfo) {
  return {
    ...marshall(trackInfo)
  }
}
