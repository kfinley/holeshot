import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { TrackInfo, Event } from "@holeshot/types/src";

export function convertTrackInfoToItem(track: TrackInfo): {
  [key: string]: AttributeValue;
} | undefined {

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
    type: {
      S: 'Event'
    },
    eventType: {
      S: event.details['type'] ?? event.name // When no Type is in Details we use the name. Not ideal... sort this out.
    },
    created: {
      S: created
    },
    ...marshall(event)
  }
}

