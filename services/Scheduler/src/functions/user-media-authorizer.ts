import { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda';
// import { CognitoIdentityProviderClient, GetUserCommand, HttpsHandler, JWK } from '@aws-sdk/client-cognito-identity-provider';
// import { decode, verify } from 'jsonwebtoken';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { CognitoIdentityClient, GetOpenIdTokenForDeveloperIdentityCommand } from "@aws-sdk/client-cognito-identity";
// import { CognitoIdentityProviderClient, GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";

const AWS_REGION = 'us-east-1';               // TODO: fix....

const getSSMValue = async (Name: string) => {
  const ssm = new SSMClient({ region: AWS_REGION });
  const command = new GetParameterCommand({ Name });
  const ssmParamValue = await ssm.send(command);
  return ssmParamValue.Parameter?.Value;
}

const cognito = new CognitoIdentityClient({ region: 'us-east-1' });

export const handler = async (event: any) => {
  console.log('event:', event);

  const USER_POOL_ID = await getSSMValue('/holeshot/user-poo-id');
  const IDENTITY_POOL_ID = await getSSMValue('/holeshot/identity-pool-id');

  const request = event.Records[0].cf.request;
  const path = request.uri;
  const headers = request.headers;

  if (headers.authorization) {
    const params = {
      IdentityPoolId: IDENTITY_POOL_ID,
      Logins: {
        [`cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}`]: headers.authorization[0].value,
      },
    };

    const result = await cognito.send(new GetOpenIdTokenForDeveloperIdentityCommand(params));

    console.log(result);
    const token = result.Token;

    if (token) { // token is valid.

      //TODO: update this so that it validates that the key path is the same as the cognito user's GUID
      // Set the S3 object key based on the request path
      const s3ObjectKey = path.substring(1); // Remove the leading '/'
      request.origin.s3.path = `${s3ObjectKey}`;
      return request;
    }
  }

  const response = {
    status: '401',
    statusDescription: 'Unauthorized',
    body: 'Unauthorized',
    headers: {
      'www-authenticate': [{ key: 'WWW-Authenticate', value: 'Basic' }],
    },
  };

  return response;
};
