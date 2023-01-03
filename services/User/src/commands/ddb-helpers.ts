import { AttributeValue } from "@aws-sdk/client-dynamodb";
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

export function convertUserToItem(ownerId: string, user: User): {
  [key: string]: AttributeValue;
} | undefined {

  // const optionalAttributes = convertUserOptionalAttributesToItem(user);

  const created = new Date().toISOString();

  return {
    PK: {
      S: `OWNER#${ownerId}`
    },
    SK: {
      S: `USER#${user.email}`
    },
    GSI1SK: {
      S: `CREATED_CREATED_DATE#${created}`
    },
    type: {
      S: 'User'
    },
    id: {
      S: user.id as string
    },
    email: {
      S: user.email
    },
    dateCreated: {
      S: created
    },
    firstName: {
      S: user.firstName
    },
    lastName: {
      S: user.lastName
    },
    // ...optionalAttributes
  }
}
