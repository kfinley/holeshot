import { writeFileSync } from 'fs';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { DotNetFunction } from '@xaaskit-cdk/aws-lambda-dotnet'
import { Duration } from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { IRole, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function as LambdaFunction, Code, Runtime } from "aws-cdk-lib/aws-lambda";
import { createLambda } from '.';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';

export interface CrawlerServiceProps {
  domainName: string;
  crawlerBucket: Bucket;
  coreTable: Table;
  node_env: string;
}

export class CrawlerService extends Construct {

  constructor(scope: Construct, id: string, props?: CrawlerServiceProps) {
    super(scope, id);

    const newLambda = (name: string, handler: string, env?: {
      [key: string]: string;
    } | undefined) => {
      return createLambda(this, name, '../../services/Crawler/src/node/dist', handler, props!.node_env, env);
    }

    // const {
    //   accountId,
    //   region,
    // } = new ScopedAws(this);

    const settings = {
      Logging: {
        LogLevel: {
          Default: "Information",
          Microsoft: "Warning"
        }
      },
      Services: {
        Crawler: {
          BucketName: `${props!.domainName}-crawler` // props?.crawlerBucket.bucketName <-- isn't working and outputs stuff like ${Token[TOKEN.661]}
        }
      }
    }
    writeFileSync(`../services/Crawler/src/dotnet/functions/appsettings.Production.json`, JSON.stringify(settings), {
      flag: 'w',
    });

    const getTracks = new DotNetFunction(this, 'Holeshot-GetTracksForRegion', {
      projectDir: '../services/Crawler/src/dotnet/functions',
      handler: 'Crawler.Functions::Holeshot.Crawler.Functions.GetTracksForState::Handler',
      timeout: Duration.seconds(300),
      functionName: 'Holeshot-GetTracksForRegion',
      logRetention: RetentionDays.ONE_WEEK
    });

    var bucketPolicy = new Policy(this, 'Holeshot-list-buckets-policy', {
      statements: [new PolicyStatement({
        actions: [
          's3:ListBucket',
          's3:GetObject',
          's3:PutObject'
        ],
        resources: [`arn:aws:s3:::*`] // ${props!.domainName}-crawler/*`], <-- tighten up...
      })],
    });

    getTracks.role?.attachInlinePolicy(
      bucketPolicy,
    );

    const decodeEmailsLambda = new LambdaFunction(this, 'Holeshot-DecodeEmailsFunction', {
      functionName: 'Holeshot-DecodeEmails',
      code: Code.fromAsset('../services/Crawler/src/python/', { exclude: ["**", "!*.py"] }),
      handler: 'functions.decode-emails.handler',
      runtime: Runtime.PYTHON_3_8,
      environment: {
        BUCKET_NAME: `${props!.domainName}-crawler`,
        // DECODE_EMAILS_TOPIC_ARN: decodeEmailsTopic.topicArn
      }
    });
    decodeEmailsLambda.role?.attachInlinePolicy(bucketPolicy);

    const saveTrackInfo = newLambda('Holeshot-SaveTrackInfo', 'functions/saveTrackInfo.handler', {
      BUCKET_NAME: `${props!.domainName}-crawler`,
      HOLESHOT_CORE_TABLE: props?.coreTable.tableName as string,
    });

    saveTrackInfo.role?.attachInlinePolicy(bucketPolicy);

    const saveTrackEvents = newLambda('Holeshot-SaveTrackEvents', 'functions/saveTrackEvents.handler', {
      BUCKET_NAME: `${props!.domainName}-crawler`,
      HOLESHOT_CORE_TABLE: props?.coreTable.tableName as string,
    });

    props?.crawlerBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(decodeEmailsLambda),
      {
        prefix: 'encoded/'
      }
    );

    props?.crawlerBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(saveTrackInfo),
      {
        prefix: 'tracks/'
      }
    );

    props?.crawlerBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(saveTrackEvents),
      {
        prefix: 'events/'
      }
    )
  }
}
