import { Construct } from 'constructs';
import { Effect, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function, Code, Runtime } from "aws-cdk-lib/aws-lambda";
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

    const getEventsNearby = super.newLambda('GetNearbyEvents', 'functions/get-nearby-events.handler', {
      HOLESHOT_CORE_TABLE: props?.coreTable.tableName as string,
      HOLESHOT_GEO_TABLE: props?.geoTable.tableName as string
    });

    props?.coreTable.grantReadData(getEventsNearby);
    props?.geoTable.grantFullAccess(getEventsNearby);

    const lambdaInvokePolicy = new Policy(this, 'Holeshot-GetNearbyEvents-LambdaInvokePolicy');
    lambdaInvokePolicy.addStatements(
      new PolicyStatement({
        actions: [
          "lambda:InvokeFunction"
        ],
        effect: Effect.ALLOW,
        resources: [ getEventsNearby.functionArn ]
      })
    )
    props?.onMessageHandler.role?.attachInlinePolicy(lambdaInvokePolicy);
  }
}
