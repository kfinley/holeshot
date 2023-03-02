import { CfnOutput, Duration, RemovalPolicy, ScopedAws } from 'aws-cdk-lib';
import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Chain, Choice, Condition, Fail, LogLevel, StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Effect, IRole, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { createLambda } from '.';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { BaseServiceConstruct } from './base-service-construct';
import { Function } from 'aws-cdk-lib/aws-lambda';

export interface WebSocketsStackProps {
  domainName: string;
  zone: HostedZone;
  certificate: DnsValidatedCertificate;
  connectionsTable: Table;
  node_env: string;
  logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
}


export class WebSocketsStack extends BaseServiceConstruct {

  public webSocketApi: WebSocketApi;
  public onMessageHandler: Function;

  constructor(scope: Construct, id: string, props?: WebSocketsStackProps) {
    super(scope, id, '../../services/WebSockets/dist', props!.node_env);

    // Lambda Functions....
    const authorizerHandler = super.newLambda('AuthorizerHandler', 'functions/auth.handler');

    const onConnectHandler = super.newLambda('OnConnectHandler', 'functions/connect.handler', {
      WEBSOCKETS_CONNECTION_TABLE: props!.connectionsTable.tableName
    });
    props?.connectionsTable.grantReadWriteData(onConnectHandler);

    const onDisconnectHandler = super.newLambda('OnDisconnectHandler', 'functions/disconnect.handler', {
      WEBSOCKETS_CONNECTION_TABLE: props!.connectionsTable.tableName
    });
    props?.connectionsTable.grantReadWriteData(onDisconnectHandler);

    this.onMessageHandler = super.newLambda('OnMessageHandler', 'functions/default.handler');

    const getConnection = super.newLambda('GetConnection', 'functions/getConnection.handler', {
      WEBSOCKETS_CONNECTION_TABLE: props!.connectionsTable.tableName
    });
    props?.connectionsTable.grantReadWriteData(getConnection);

    const authorizer = new WebSocketLambdaAuthorizer('Authorizer', authorizerHandler, {
      identitySource: [
        'route.request.header.Sec-WebSocket-Protocol']
    });

    this.webSocketApi = new WebSocketApi(this, 'HoleshotWebSocketApi', {
      apiName: 'Holeshot Websocket API',
      connectRouteOptions: { integration: new WebSocketLambdaIntegration("ConnectIntegration", onConnectHandler), authorizer },
      disconnectRouteOptions: { integration: new WebSocketLambdaIntegration("DisconnectIntegration", onDisconnectHandler) },
      defaultRouteOptions: { integration: new WebSocketLambdaIntegration("DefaultIntegration", this.onMessageHandler) },
    });

    const stage = new WebSocketStage(this, 'Prod', {
      webSocketApi: this.webSocketApi,
      stageName: 'v1',
      autoDeploy: true,
    });

    const { region } = new ScopedAws(this);

    const sendMessage = super.newLambda('SendMessage', 'functions/sendMessage.handler', {
      APIGW_ENDPOINT: `${this.webSocketApi.apiId}.execute-api.${region}.amazonaws.com/v1` // `ws.${props!.domainName}/v1`
    });

    new CfnOutput(this, 'apigateay-endpoint', {
      value: `${this.webSocketApi.apiId}.execute-api.${region}.amazonaws.com/v1`
    });
    const startSendMessageNotification = super.newLambda('StartSendMessageNotification', 'functions/startSendMessageNotification.handler')

    // Lambda Functions end...

    // SNS Topics & Subscriptions...
    const authProcessedTopic = new Topic(this, 'sns-topic', {
      topicName: 'Holeshot-AuthProcessedTopic',
      displayName: 'AuthProcessedTopic',
    });

    authProcessedTopic.grantPublish(onConnectHandler.role as IRole);
    authProcessedTopic.addSubscription(new LambdaSubscription(startSendMessageNotification));

    new CfnOutput(this, 'AuthProcessedTopic', {
      value: `AuthProcessedTopic ARN: ${authProcessedTopic.topicArn}`
    });

    // SNS Topics & Subs end...

    // Step Functions...

    const getConnectionInvocation = new LambdaInvoke(this, "GetConnectionInvocation", {
      lambdaFunction: getConnection,
      outputPath: '$.Payload',
    });

    const sendMessageInvocation = new LambdaInvoke(this, "SendMessageInvocation", {
      lambdaFunction: sendMessage,
    });

    sendMessageInvocation.addRetry({
      errors: ['UnknownException'],
      maxAttempts: 3,
      backoffRate: 2,
      interval: Duration.seconds(10)
    });

    const isConnected = new Choice(this, 'HasConnectionId?');

    const chain = Chain
      .start(getConnectionInvocation)
      .next(
        isConnected
          .when(Condition.stringEquals('$.connectionId', ''), new Fail(this, "Fail", { error: "No ConnectionId Found" }))
          .otherwise(sendMessageInvocation));

    const sfnLog = new LogGroup(this, "sfnLog", {
      logGroupName: "Holeshot-WebSockets-SendMessage-LogGroup",
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_WEEK
    })

    // replace this with https://github.com/mbonig/state-machine or something similar
    const stateMachine = new StateMachine(this, 'Holeshot-WebSockets-SendMessage', {
      stateMachineName: 'Holeshot-WebSockets-SendMessage',
      definition: chain,
      logs: {
        destination: sfnLog,
        includeExecutionData: true,
        level: LogLevel.ALL
      }
    });

    new CfnOutput(this, 'StateMachineArn', {
      value: `SendMessage StateMachine arn: ${stateMachine.stateMachineArn}`
    });

    const sfnLambdaInvokePolicy = new Policy(this, 'sfnLambdaInvokePolicy');
    sfnLambdaInvokePolicy.addStatements(
      new PolicyStatement({
        actions: [
          "lambda:InvokeFunction"
        ],
        effect: Effect.ALLOW,
        resources: [`${startSendMessageNotification.functionArn}:$LATEST`],
        sid: "sfnLambdaInvokePolicy"
      })
    )
    stateMachine.role.attachInlinePolicy(sfnLambdaInvokePolicy)

    const lambdaSfnStatusUpdatePolicy = new Policy(this, 'lambdaSfnStatusUpdatePolicy');
    lambdaSfnStatusUpdatePolicy.addStatements(
      new PolicyStatement({
        actions: [
          "states:SendTaskSuccess",
          "states:SendTaskFailure",
          "states:ListStateMachines",
          "states:StartExecution"
        ],
        effect: Effect.ALLOW,
        resources: ['*'],     //TODO: tighten this up...
        // resources: [`${stateMachine.stateMachineArn}:$LATEST`],
        sid: "lambdaSfnStatusUpdatePolicy"
      })
    )
    startSendMessageNotification.role?.attachInlinePolicy(lambdaSfnStatusUpdatePolicy)

    // Step Functions end...

    // Configure WebSockets...

    this.webSocketApi.grantManageConnections(this.onMessageHandler);
    this.webSocketApi.grantManageConnections(sendMessage);

    new CfnOutput(this, 'webSocketApi.apiEndpoint', {
      value: `api endpoint: ${this.webSocketApi.apiEndpoint}`
    });

    new CfnOutput(this, 'stage.url', {
      value: `stage url: ${stage.url}`
    });


    // Review https://aws.plainenglish.io/setup-api-gateway-websocket-api-with-cdk-c1e58cf3d2be

    // Add routes for commands sent from client
    //
    // addRoute allows messaged like {"action":"addTodo","data":"hello world"} to be passed to ws and it lands on the right handler
    // webSocketApi.addRoute('addTodo', {
    //   integration: new LambdaWebSocketIntegration({
    //     handler: addTodoHandler,
    //   }),
    // });


    // WebSockets end...

  }

}
