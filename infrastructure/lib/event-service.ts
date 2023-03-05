import { Construct } from 'constructs';
import { Function } from "aws-cdk-lib/aws-lambda";
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { BaseServiceConstruct } from './base-service-construct';
import { ScopedAws } from 'aws-cdk-lib';
import { Effect, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';

export interface EventServiceProps {
  domainName: string;
  coreTable: Table;
  node_env: string;
  sendMessageStateMachine: StateMachine;
}

export class EventService extends BaseServiceConstruct {

  readonly getNearbyEvents: Function;

  constructor(scope: Construct, id: string, props?: EventServiceProps) {
    super(scope, id, '../../services/Event/dist', props!.node_env);

    const {
      accountId,
      region,
    } = new ScopedAws(this);

    const geoTable = Table.fromTableArn(this, 'Holeshot-Geo', `arn:aws:dynamodb:${region}:${accountId}:table/Holeshot-Geo`);

    this.getNearbyEvents = super.newLambda('GetNearbyEvents', 'functions/get-nearby-events.handler', {
      HOLESHOT_CORE_TABLE: props?.coreTable.tableName as string,
      HOLESHOT_GEO_TABLE: geoTable.tableName.includes('/') ? geoTable.tableName.split('/')[1] : geoTable.tableName // stupid... for some reason ITable.tableName is returning {accountId}:table/{tableName}
    });

    // Holeshot-Infrastructure-GetNearbyEvents is not authorized to perform: dynamodb:Query on resource:
    // arn:aws:dynamodb:us-east-1:146665891952:table/Holeshot-Geo/index/geohash-index because no identity-based policy allows the dynamodb:Query action
    // arn:aws:dynamodb:us-east-1:146665891952:table/146665891952:table/Holeshot-Geo/index/geohash-index
    props?.coreTable.grantReadData(this.getNearbyEvents);
    geoTable.grantReadData(this.getNearbyEvents);

    const dynamodbQueryPolicy = new Policy(this, 'Holeshot-GetNearbyEvents-Inline-LambdaInvokePolicy');
    dynamodbQueryPolicy.addStatements(
      new PolicyStatement({
        actions: [
          "dynamodb:Query"
        ],
        effect: Effect.ALLOW,
        resources: [
          `${geoTable.tableArn}/*`
        ]
      })
    );

    this.getNearbyEvents.role?.attachInlinePolicy(dynamodbQueryPolicy);

    const lambdaSfnStatusUpdatePolicy = new Policy(this, 'Holeshot-GetNearbyEvents-lambdaSfnStatusUpdatePolicy');
    lambdaSfnStatusUpdatePolicy.addStatements(
      new PolicyStatement({
        actions: [
          "states:SendTaskSuccess",
          "states:SendTaskFailure",
          "states:ListStateMachines",
          "states:StartExecution"
        ],
        effect: Effect.ALLOW,
        resources: [`${props?.sendMessageStateMachine.stateMachineArn}`]
      })
    );

    this.getNearbyEvents.role?.attachInlinePolicy(lambdaSfnStatusUpdatePolicy);
  }
}
