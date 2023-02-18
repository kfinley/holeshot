import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { Track, Location, Address } from "@holeshot/types/src";

function addWithKeyIfPropHasValue(attributes: Record<string, AttributeValue>, property: string, value: string | undefined) {
  if (value) {
    attributes[property] = {
      S: value
    }
  }
}

function convertUserOptionalAttributesToItem(track: Track) {
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
    zip: {
      S: address.zip
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

  for (let op in operators) {
    if (op.indexOf('@') == -1) {
      result[op] = {
        S: operators[operators.indexOf(op) + 1]
      }
    } else {
      result['Email'] = {
        S: op
      }
    }
  }
  return result;

}

export function convertTrackToItem(ownerId: string, track: Track): {
  [key: string]: AttributeValue;
} | undefined {

  // const optionalAttributes = convertUserOptionalAttributesToItem(user);

  const created = new Date().toISOString();

  return {
    PK: {
      S: `OWNER#${track.name}`
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
