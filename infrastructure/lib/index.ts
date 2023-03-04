export * from './data-stores';
export * from './infrastructure-stack';
export * from './websockets-stack';
export * from './user-stack';
import { Duration, Stack } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { join } from 'path';
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export const createLambda = (scope: Construct, name: string, functionsPath: string, handler: string, node_env: string, env?: {
  [key: string]: string;
} | undefined) => {

  const path = join(__dirname, functionsPath);

  return new lambda.Function(scope, name, {
    runtime: lambda.Runtime.NODEJS_18_X,
    memorySize: 1024,
    timeout: Duration.seconds(20),
    functionName: `Holeshot-Infrastructure-${name}`,
    handler,
    code: new lambda.AssetCode(path),
    environment: {
      AVAILABILITY_ZONES: JSON.stringify(
        Stack.of(scope).availabilityZones,
      ),
      NODE_ENV: node_env,
      ...env
    },
  });
};

//https://github.com/aws/aws-cdk/issues/906
export function addCorsOptions(apiResource: apigateway.IResource) {
  apiResource.addMethod('OPTIONS', new apigateway.MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },
    }]
  })
}
