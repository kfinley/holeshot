import { S3Client } from '@aws-sdk/client-s3';
import { SNSClient, } from "@aws-sdk/client-sns";
import { SFNClient } from "@aws-sdk/client-sfn";
import { Container } from 'inversify-props';
import {
  PublishMessageCommand,
  StartStepFunctionCommand,
  GetStoredObjectCommand,
  AuthorizeCommand
} from "./index";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { SES } from '@aws-sdk/client-ses';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export default function bootstrapper(container: Container) {

  console.log('aws-commands bootstrapper');

  if (!container.isBound("CognitoIdentityClient")) {
    container.bind<CognitoIdentityClient>("CognitoIdentityClient")
      .toDynamicValue(() => process.env.NODE_ENV === 'production'
        ?
        new CognitoIdentityClient({ region: "us-east-1" }) // Prod
        :
        new CognitoIdentityClient({ // Local Dev
          endpoint: "http://holeshot.cognito:9229"
        }));
  }

  if (!container.isBound("CognitoIdentityProvider")) {
    container.bind<CognitoIdentityProvider>("CognitoIdentityProvider")
      .toDynamicValue(() => process.env.NODE_ENV === 'production'
        ?
        new CognitoIdentityProvider({ region: process.env.AWS_REGION })
        :
        new CognitoIdentityProvider({
          endpoint: "http://holeshot.cognito:9229",
          credentials: {
            accessKeyId: "local",
            secretAccessKey: "local",
          },
          region: "us-east-1",
        }));
  }

  if (!container.isBound("DynamoDBClient")) {
    container.bind<DynamoDBClient>("DynamoDBClient")
      .toDynamicValue(() => process.env.NODE_ENV === 'production'
        ?
        new DynamoDBClient({ region: process.env.AWS_REGION }) // Prod
        //   region: process.env.AWS_REGION,
        //   endpoint: 'https://dynamodb.us-east-1.amazonaws.com'
        // }) // Prod
        :
        new DynamoDBClient({ // Local Dev
          endpoint: "http://holeshot.dynamodb:8000"
        }));
  }

  if (!container.isBound("SNSClient")) {
    container.bind<SNSClient>("SNSClient")
      .toDynamicValue(() => process.env.NODE_ENV === 'production'
        ?
        new SNSClient({ region: process.env.AWS_REGION }) // Prod
        :
        new SNSClient({ // Local Dev
          region: "us-east-1",
          endpoint: "http://localhost:4002"
        }));
  }

  if (!container.isBound("SFNClient")) {
    container.bind<SFNClient>("SFNClient")
      .toDynamicValue(() => process.env.NODE_ENV === 'production'
        ?
        new SFNClient({ region: process.env.AWS_REGION }) // Prod
        :
        new SFNClient({ // Local Dev
          endpoint: "http://holeshot.sfn:8083"
        }));
  }

  if (!container.isBound("S3Client")) {

    container.bind<S3Client>("S3Client")
      .toDynamicValue(() => process.env.NODE_ENV === 'production'
        ?
        new S3Client({
          region: process.env.AWS_REGION,
          endpoint: 'https://s3.us-east-1.amazonaws.com'
        }) // Prod
        :
        new S3Client({ // Local Dev
          region: "us-east-1",
          forcePathStyle: true,
          credentials: {
            accessKeyId: 'S3RVER',
            secretAccessKey: 'S3RVER',
          }
        }));
  }

  if (!container.isBound("SES")) {
    container.bind<SES>("SES")
      .toDynamicValue(() => process.env.NODE_ENV === 'production'
        ?
        new SES({ region: process.env.AWS_REGION }) // Prod
        :
        new SES({ // Local Dev
          endpoint: 'http://localhost:8005',
          region: 'aws-ses-v2-local',
          credentials: { accessKeyId: 'ANY_STRING', secretAccessKey: 'ANY_STRING' },
        }));
  }

  container.bind<AuthorizeCommand>("AuthorizeCommand").to(AuthorizeCommand);
  container.bind<GetStoredObjectCommand>("GetStoredObjectCommand").to(GetStoredObjectCommand);
  container.bind<PublishMessageCommand>("PublishMessageCommand").to(PublishMessageCommand);
  container.bind<StartStepFunctionCommand>("StartStepFunctionCommand").to(StartStepFunctionCommand);

  // console.log('aws-commands bootstrapper done');

}
