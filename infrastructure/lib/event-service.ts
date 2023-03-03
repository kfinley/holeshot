import { writeFileSync } from 'fs';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Effect, IRole, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function, Code, Runtime } from "aws-cdk-lib/aws-lambda";
import { createLambda } from '.';
import { ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { BaseServiceConstruct } from './base-service-construct';

export interface EventServiceProps {
  domainName: string;
  coreTable: Table;
  geoTable: ITable;
  node_env: string;
  onMessageHandler: Function;
}

export class EventService extends BaseServiceConstruct {

  constructor(scope: Construct, id: string, props?: EventServiceProps) {
    super(scope, id, '../../services/Event/dist', props!.node_env);

    const getEventsNearby = super.newLambda('Holeshot-GetNearbyEvents', 'functions/get-nearby-events.handler', {
      HOLESHOT_CORE_TABLE: props?.coreTable.tableName as string,
      HOLESHOT_GEO_TABLE: props?.geoTable.tableName as string
    });

    props!.coreTable.grantReadData(getEventsNearby);
    props!.geoTable.grantFullAccess(getEventsNearby);

     const lambdaInvokePolicy = new Policy(this, 'Holeshot-GetEventsNearby-LambdaInvokePolicy');
    lambdaInvokePolicy.addStatements(
      new PolicyStatement({
        actions: [
          "lambda:InvokeFunction"
        ],
        effect: Effect.ALLOW,
        resources: [`${getEventsNearby.functionArn}:$LATEST`],
        sid: "HoleshotGetEventsNearbyLambdaInvokePolicy"
      })
    )
    props!.onMessageHandler.role?.attachInlinePolicy(lambdaInvokePolicy);

  }
}
