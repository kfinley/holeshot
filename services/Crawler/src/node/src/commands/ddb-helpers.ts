import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { TrackInfo, Location, Address, Event } from "@holeshot/types/src";

function addWithKeyIfPropHasValue(attributes: Record<string, AttributeValue>, property: string, value: string | undefined) {
  if (value) {
    attributes[property] = {
      S: value
    }
  }
}

function convertUserOptionalAttributesToItem(track: TrackInfo) {
  let attributes: Record<string, AttributeValue> = {};

  // addWithKeyIfPropHasValue(attributes, 'extendedDetails', user.extendedDetails);
  // addWithKeyIfPropHasValue(attributes, 'appearsOnStatementAs', user.appearsOnStatementAs);
  // addWithKeyIfPropHasValue(attributes, 'address', user.address);
  // addWithKeyIfPropHasValue(attributes, 'city', user.city);
  // addWithKeyIfPropHasValue(attributes, 'state', user.state);
  // addWithKeyIfPropHasValue(attributes, 'postalCode', user.postalCode);
  // addWithKeyIfPropHasValue(attributes, 'country', user.country);
  // addWithKeyIfPropHasValue(attributes, 'reference', user.reference);
  // addWithKeyIfPropHasValue(attributes, 'category', user.category);

  return attributes;
}

export function dictToMap(dict: Record<string, string>) {
  let result = {};

  for (let k in dict) {
    result[k] = {
      S: dict[k]
    }
  }
  return result;
}

export function addressToMap(address: Address) {
  return {
    line1: {
      S: address.line1
    },
    line2: {
      S: address.line2
    },
    city: {
      S: address.city
    },
    state: {
      S: address.state
    },
    postalcode: {
      S: address.postalCode
    }
  }
}

export function locationToMap(location: Location) {
  return {
    address: {
      M: addressToMap(location.address)
    },
    mapLink: {
      S: location.mapLink
    },
    gps: {
      M: {
        Lat: {
          S: location.gps.lat
        },
        long: {
          S: location.gps.long
        }
      }
    }
  };
}

export function operatorsToMap(operators: string[]) {

  let result = {}

  for (let i = 0; i < operators.length; i++) {
    if (operators[i].indexOf('@') == -1) {
      const opKey = 'Operator' + (i == 0 ? '1' : '2'); // Kludge...
      result[opKey] = {
        S: `${operators[i]} ${operators[i + 1]}`
      }
      i += 1;
    } else {
      result['Email'] = {
        S: operators[i]
      }
    }
  }
  return result;

}

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
    id: {
      S: track.id
    },
    name: {
      S: track.name
    },
    district: {
      S: track.district
    },
    dateCreated: {
      S: created
    },
    contactInfo: {
      M: dictToMap(track.contactInfo)
    },
    logoUrl: {
      S: track.logoUrl
    },
    location: {
      M: locationToMap(track.location)
    },
    webSite: {
      S: track.website
    },
    socials: {
      M: dictToMap(track.socials)
    },
    sponsors: {
      M: dictToMap(track.sponsors)
    },
    coaches: {
      M: dictToMap(track.coaches)
    },
    operators: {
      M: operatorsToMap(track.operators as string[])
    }
    // ...optionalAttributes
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
      S: `CREATED_CREATED_DATE#${created}`
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
