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
  coreTable: Table;
  geoTableName: string;
  node_env: string;
}

export class EventsService extends Construct {

}
