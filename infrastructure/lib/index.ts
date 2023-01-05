export * from './data-stores';
export * from './infrastructure-stack';
export * from './websockets-api';
import { Duration, Stack } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { join } from 'path';

export const createLambda = (scope: Construct, name: string, functionsPath: string, handler: string, node_env: string, env?: {
  [key: string]: string;
} | undefined) => {

  return new lambda.Function(scope, name, {
    runtime: lambda.Runtime.NODEJS_16_X,
    memorySize: 1024,
    timeout: Duration.seconds(5),
    functionName: `Holeshot-Infrastructure-${name}`,
    handler,
    code: new lambda.AssetCode(join(__dirname, `${functionsPath}`)),
    environment: {
      REGION: Stack.of(scope).region,
      AVAILABILITY_ZONES: JSON.stringify(
        Stack.of(scope).availabilityZones,
      ),
      NODE_ENV: node_env,
      ...env
    },
  });
};
