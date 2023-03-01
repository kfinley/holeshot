import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { User } from "@holeshot/types/src/user";

function addWithKeyIfPropHasValue(attributes: Record<string, AttributeValue>, property: string, value: string | undefined) {
  if (value) {
    attributes[property] = {
      S: value
    }
  }
}

function convertUserOptionalAttributesToItem(user: User) {
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

export function convertUserToItem(user: User): {
  [key: string]: AttributeValue;
} | undefined {

  // const optionalAttributes = convertUserOptionalAttributesToItem(user);

  const created = new Date().toISOString();

  return {
    PK: {
      S: `USER#${user.email}`
    },
    SK: {
      S: `USER#${user.email}`
    },
    type: {
      S: 'User'
    },
    ...marshall(user)
  }
}
