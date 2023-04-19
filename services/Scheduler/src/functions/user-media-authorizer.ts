import { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda';
import { CognitoIdentityProviderClient, GetUserCommand, HttpsHandler, JWK } from '@aws-sdk/client-cognito-identity-provider';
import { decode, verify } from 'jsonwebtoken';
import { promisify } from 'util';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const AWS_REGION = 'us-east-1';               // TODO: fix....
const getUserPoolIdFromSSM = async () => {
  const ssm = new SSMClient({ region: AWS_REGION });
  const command = new GetParameterCommand({ Name: '/holeshot/userPoolId' });
  const ssmParamValue = await ssm.send(command);
  return ssmParamValue.Parameter?.Value;
}

const USER_POOL_ID = getUserPoolIdFromSSM();

export const handler = async (event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> => {

  console.log('event', event);

  const request = event.Records[0].cf.request;
  const path = request.uri;

  //TODO: update this so that it validates that the key path is the same as the cognito user's GUID
  // Set the S3 object key based on the request path
  const s3ObjectKey = path.substring(1); // Remove the leading '/'
  request.origin.s3.path = `${s3ObjectKey}`;

  const headers = request.headers;
  const authorizationHeader = headers.authorization ? headers.authorization[0].value : '';

  if (!authorizationHeader) {
    return generateUnauthorizedResponse();
  }

  const token = authorizationHeader.split(' ')[1];

  try {
    const jwtPayload = await validateToken(token);
    console.log('JWT payload:', jwtPayload);

    // If the token is valid, allow the request to proceed
    return request;
  } catch (error) {
    console.error('Token validation error:', error);
    return generateUnauthorizedResponse();
  }
};

async function validateToken(token: string): Promise<unknown> {
  const keysUrl = `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;
  const jwks = await fetchJson(keysUrl);
  const signingKey = getSigningKey(jwks, token);

  const decoded = decode(token, { complete: true });
  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid JWT token');
  }

  const verifyAsync = promisify(verify);
  return verifyAsync(token, signingKey.pem, { algorithms: ['RS256'], audience: decoded.payload.aud, issuer: decoded.payload.iss });
}

async function fetchJson(url: string): Promise<JWK[]> {
  const https = new HttpsHandler();
  const client = new CognitoIdentityProviderClient({ AWS_REGION, https });
  const command = new GetUserCommand({ UserPoolId: USER_POOL_ID, Username: 'dummy' });
  const response = await client.send(command);
  const jwks = JSON.parse(response.UserPoolMfaConfig as string).Jwks;
  return jwks.keys;
}

function getSigningKey(jwks: { keys: JWK[] }, token: string): { kid: string; nbf: number; pem: string } {
  const decoded = decode(token, { complete: true });
  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid JWT token');
  }

  const kid = decoded.header.kid;
  const key = jwks.keys.find((k) => k.kid === kid);
  if (!key) {
    throw new Error('JWK not found');
  }

  const nbf = key.nbf ? key.nbf : 0;
  const pem = jwkToPem(key);

  return { kid, nbf, pem };
}

function jwkToPem(jwk: JWK): string {
  const modulus = Buffer.from(jwk.n, 'base64');
  const exponent = Buffer.from(jwk.e, 'base64');
  const key = { kty: 'RSA', n: modulus.toString('base64'), e: exponent.toString('base64') };
  return `-----BEGIN PUBLIC KEY-----\n${Buffer.from(JSON.stringify(key)).toString('base64').match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
}

function generateUnauthorizedResponse(): CloudFrontRequestResult {
  return {
    status: '401',
    statusDescription: 'Unauthorized',
    headers: {
      'www-authenticate': [{ key: 'WWW-Authenticate', value: 'Bearer' }],
    },
  };
}
