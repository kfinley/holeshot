import { readFileSync, writeFileSync } from 'fs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { DotNetFunction } from '@xaaskit-cdk/aws-lambda-dotnet'
import { Duration } from 'aws-cdk-lib';

export interface CrawlerServiceProps {
  crawlerBucket: Bucket,
}

export class CrawlerService extends Construct {

  constructor(scope: Construct, id: string, props?: CrawlerServiceProps) {
    super(scope, id);

    const settings = {
      AWS: {
        Region: "us-east-1",
      },
      Logging: {
        LogLevel: {
          Default: "Information",
          Microsoft: "Warning"
        }
      },
      Services: {
        Crawler: {
          Bucket: props?.crawlerBucket.bucketArn
        }
      }
    }
    writeFileSync(`../services/Crawler/src/functions/appsettings.Production.json`, JSON.stringify(settings), {
      flag: 'w',
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
    })
  }
}
