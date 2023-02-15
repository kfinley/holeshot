import { writeFileSync } from 'fs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { DotNetFunction } from '@xaaskit-cdk/aws-lambda-dotnet'
import { Duration, ScopedAws } from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Topic } from 'aws-cdk-lib/aws-sns';
export interface CrawlerServiceProps {
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
          Bucket: props?.crawlerBucket.bucketName
        }
      }
    }
    writeFileSync(`../services/Crawler/src/functions/appsettings.Production.json`, JSON.stringify(settings), {
      flag: 'w',
    });

    const getTracksForStateTopic = new Topic(this, 'Holeshot-GetTracksForStateTopic-sns-topic', {
      topicName: 'Holeshot-GetTracksForStateTopic',
      displayName: 'GetTracksForStateTopic',
    });

    const getTracks = new DotNetFunction(this, 'Holeshot-GetTracksForRegion', {
      bundling: {
        environment: {
          ASPNETCORE_ENVIRONMENT: 'Production'
        }
      },
      projectDir: '../services/Crawler/src/functions',
      solutionDir: '../services',
      handler: 'Crawler.Functions::Holeshot.Crawler.Functions.GetTracksForState::Handler',
      timeout: Duration.seconds(300),
      functionName: 'Holeshot-GetTracksForRegion',
      logRetention: RetentionDays.ONE_WEEK
    })
  }
}
