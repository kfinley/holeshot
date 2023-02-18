import { writeFileSync } from 'fs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { DotNetFunction } from '@xaaskit-cdk/aws-lambda-dotnet'
import { Duration, ScopedAws } from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { IRole, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function as LambdaFunction, Code, Runtime } from "aws-cdk-lib/aws-lambda";
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { createLambda } from '.';

export interface CrawlerServiceProps {
  domainName: string;
  crawlerBucket: Bucket;
  node_env: string;
}

export class CrawlerService extends Construct {

  constructor(scope: Construct, id: string, props?: CrawlerServiceProps) {
    super(scope, id);

    const newLamda = (name: string, handler: string, env?: {
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

    const decodeEmailsTopic = new Topic(this, 'Holeshot-DecodeEmailsTopic', {
      topicName: 'Holeshot-DecodeEmailsTopic',
      displayName: 'DecodeEmailsTopic'
    })

    const decodeEmailsLambda = new LambdaFunction(this, 'Holeshot-DecodeEmailsFunction', {
      functionName: 'Holeshot-DecodeEmails',
      code: Code.fromAsset('../services/Crawler/src/python/functions', { exclude: ["**", "!decode-emails.py"] }),
      handler: 'decode-emails.handler',
      runtime: Runtime.PYTHON_3_8,
      environment: {
        BUCKET_NAME: `${props!.domainName}-crawler`,
        DECODE_EMAILS_TOPIC_ARN: decodeEmailsTopic.topicArn
      }
    });
    decodeEmailsLambda.role?.attachInlinePolicy(
      bucketPolicy,
    );
    decodeEmailsTopic.grantPublish(decodeEmailsLambda);

    const getTracksForRegionTopic = new Topic(this, 'Holeshot-GetTracksForRegionTopic-sns-topic', {
      topicName: 'Holeshot-GetTracksForRegionTopic',
      displayName: 'GetTracksForRegionTopic',
    });
    getTracksForRegionTopic.grantPublish(getTracks.role as IRole);
    getTracksForRegionTopic.addSubscription(new LambdaSubscription(decodeEmailsLambda));

    const saveTrackInfo = newLamda('Holeshot-SaveTrackInfo', 'functions/saveTrackInfo.handler')
    decodeEmailsTopic.addSubscription(new LambdaSubscription(saveTrackInfo));

  }
}
