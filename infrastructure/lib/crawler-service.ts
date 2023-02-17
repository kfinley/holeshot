import { writeFileSync } from 'fs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { DotNetFunction } from '@xaaskit-cdk/aws-lambda-dotnet'
import { Duration, ScopedAws } from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { IRole, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { PythonLambdaFunction } from './python-lambda-construct';
import { resolve } from 'path';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
export interface CrawlerServiceProps {
  domainName: string,
  crawlerBucket: Bucket,
}

export class CrawlerService extends Construct {

  constructor(scope: Construct, id: string, props?: CrawlerServiceProps) {
    super(scope, id);

    const {
      accountId,
      region,
    } = new ScopedAws(this);

    const settings = {
      // AWS: {
      //   Region: region
      // },
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
    writeFileSync(`../services/Crawler/src/functions/appsettings.Production.json`, JSON.stringify(settings), {
      flag: 'w',
    });

    const getTracks = new DotNetFunction(this, 'Holeshot-GetTracksForRegion', {
      projectDir: '../services/Crawler/src/Functions',
      solutionDir: '../services',
      handler: 'Crawler.Functions::Holeshot.Crawler.Functions.GetTracksForState::Handler',
      timeout: Duration.seconds(300),
      functionName: 'Holeshot-GetTracksForRegion',
      logRetention: RetentionDays.ONE_WEEK
    });

    getTracks.role?.attachInlinePolicy(
      new Policy(this, 'Holeshot-list-buckets-policy', {
        statements: [new PolicyStatement({
          actions: [
            's3:ListBucket',
            's3:GetObject',
            's3:PutObject'
          ],
          resources: [`arn:aws:s3:::*`] // ${props!.domainName}-crawler/*`], <-- tighten up...
        })],
      }),
    );

    console.log(resolve(
      __dirname,
      "../services/Crawler/src/Functions/Decode-Emails"
    ));

    // The code that defines your stack goes here
    const decodeEmailsLambda = new PythonLambdaFunction(this, "DecodeEmailsLambda", {
      functionName: 'Holeshot-DecodeEmails',
      lambdaAssetProps: {
        functionFolderPath: resolve(
          __dirname,
          "../../services/Crawler/src/Functions/Decode-Emails"
        ),
      },
    });

    const getTracksForRegionTopic = new Topic(this, 'Holeshot-GetTracksForRegionTopic-sns-topic', {
      topicName: 'Holeshot-GetTracksForRegionTopic',
      displayName: 'GetTracksForRegionTopic',
    });
    getTracksForRegionTopic.grantPublish(getTracks.role as IRole);
    getTracksForRegionTopic.addSubscription(new LambdaSubscription(decodeEmailsLambda.lambda));

  }
}
