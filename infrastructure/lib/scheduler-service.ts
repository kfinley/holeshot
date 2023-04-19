import { Construct } from 'constructs';
import { Function } from "aws-cdk-lib/aws-lambda";
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { BaseServiceConstruct } from './base-service-construct';
import { ScopedAws } from 'aws-cdk-lib';
import { Effect, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
export interface SchedulerServiceProps {
  domainName: string;
  coreTable: Table;
  node_env: string;
  sendMessageStateMachine: StateMachine;
  userPoolId: string;
}

export class SchedulerService extends BaseServiceConstruct {

  readonly getNearbyEvents: Function;
  readonly putEntity: Function;
  readonly sendSchedulerData: Function;
  readonly updateEntity: Function;
  readonly deleteEntity: Function;
  readonly userMediaAuth: cloudfront.experimental.EdgeFunction;

  constructor(scope: Construct, id: string, props?: SchedulerServiceProps) {
    super(scope, id, '../../services/Scheduler/dist', props!.node_env);

    const {
      accountId,
      region,
    } = new ScopedAws(this);

    const geoTable = Table.fromTableArn(this, 'Holeshot-Geo', `arn:aws:dynamodb:${region}:${accountId}:table/Holeshot-Geo`);

    this.getNearbyEvents = super.newLambda('GetNearbyEvents', 'functions/get-nearby-events.handler', {
      HOLESHOT_CORE_TABLE: props!.coreTable.tableName,
      HOLESHOT_GEO_TABLE: geoTable.tableName.includes('/') ? geoTable.tableName.split('/')[1] : geoTable.tableName // stupid... for some reason ITable.tableName is returning {accountId}:table/{tableName}
    }, 120, 512);
    props?.coreTable.grantReadData(this.getNearbyEvents);
    geoTable.grantReadData(this.getNearbyEvents);

    this.putEntity = super.newLambda('PutEntity', 'functions/put-entity.handler', {
      HOLESHOT_CORE_TABLE: props!.coreTable.tableName,
    }, 120);
    props?.coreTable.grantWriteData(this.putEntity);

    this.deleteEntity = super.newLambda('DeleteEntity', 'functions/delete-entity.handler', {
      HOLESHOT_CORE_TABLE: props!.coreTable.tableName,
    }, 120);
    props?.coreTable.grantReadData(this.deleteEntity);
    props?.coreTable.grantWriteData(this.deleteEntity);

    this.updateEntity = super.newLambda('UpdateEntity', 'functions/update-entity.handler', {
      HOLESHOT_CORE_TABLE: props!.coreTable.tableName,
    }, 120);
    props?.coreTable.grantReadData(this.updateEntity);
    props?.coreTable.grantWriteData(this.updateEntity);

    this.sendSchedulerData = super.newLambda('SendSchedulerData', 'functions/send-scheduler-data.handler', {
      HOLESHOT_CORE_TABLE: props!.coreTable.tableName,
    }, 120);
    props?.coreTable.grantReadData(this.sendSchedulerData);

    this.userMediaAuth = super.newEdgeFunction('UserMediaAuth', 'functions/user-media-authorizer', {
      USER_POOL_ID: props?.userPoolId!
    })
    this.userMediaAuth.role?.attachInlinePolicy(
      new Policy(this, 'User-Media-Auth-Policy', {
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['cognito-idp:GetUser'],
            resources: [`arn:aws:cognito-idp:*:*:userpool/${props!.userPoolId}`],
          }),
        ],
      }),
    );

    //TODO: try removing this... shouldn't need it b/c of the line above.
    this.getNearbyEvents.role?.attachInlinePolicy(new Policy(this, 'Holeshot-Core-DynamoDBQueryPolicy', {
      statements: [
        new PolicyStatement({
          actions: [
            "dynamodb:Query"
          ],
          effect: Effect.ALLOW,
          resources: [
            `${geoTable.tableArn}/*`
          ]
        }),
      ]
    }));

    const lambdaSfnStatusUpdatePolicy = new Policy(this, 'Holeshot-GetNearbyEvents-LambdaSfnPolicy');
    lambdaSfnStatusUpdatePolicy.addStatements(
      new PolicyStatement({
        actions: [
          "states:SendTaskSuccess",
          "states:SendTaskFailure",
          "states:ListStateMachines",
          "states:StartExecution"
        ],
        effect: Effect.ALLOW,
        resources: [
          `arn:aws:states:${region}:${accountId}:stateMachine:*`
        ]
      })
    );

    this.getNearbyEvents.role?.attachInlinePolicy(lambdaSfnStatusUpdatePolicy);
    this.putEntity.role?.attachInlinePolicy(lambdaSfnStatusUpdatePolicy);
    this.deleteEntity.role?.attachInlinePolicy(lambdaSfnStatusUpdatePolicy);
    this.updateEntity.role?.attachInlinePolicy(lambdaSfnStatusUpdatePolicy);
    this.sendSchedulerData.role?.attachInlinePolicy(lambdaSfnStatusUpdatePolicy);
  }
}
