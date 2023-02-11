import { Stack, Duration, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { join } from 'path';
import { NodejsFunction, NodejsFunctionProps, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Chain, Choice, Condition, Fail, LogLevel, Pass, StateMachine, Succeed } from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Effect, IRole, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { createLambda } from '.';

export interface WebSocketsStackProps {
  connectionsTable: Table;
  node_env: string;
  logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
}

export class WebSocketsStack extends Construct {

  public webSocketApi: WebSocketApi;

  constructor(scope: Construct, id: string, props?: WebSocketsStackProps) {
    super(scope, id);

    const functionsPath = '../../services/WebSockets/dist';

    // TODO: remove...
    const createNodeJsFunction = (name: string, path: string) => {

      const nodeJsFunctionProps: NodejsFunctionProps = {
        functionName: `Holeshot-Infrastructure-${name}`,
        projectRoot: join(__dirname, '../../services/WebSockets'),
        entry: join(__dirname, `../../services/WebSockets/src/functions/${path}`),
        bundling: {
          // assetHash: 'my-custom-hash',
          externalModules: [
            'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
          ],
          // preCompilation: true,
          minify: true, // minify code, defaults to false
          sourceMap: true, // include source map, defaults to false
          sourceMapMode: SourceMapMode.INLINE, // defaults to SourceMapMode.DEFAULT
          sourcesContent: false, // do not include original source into source map, defaults to true
          target: 'es2020', // target environment for the generated JavaScript code,
        },
        depsLockFilePath: join(__dirname, '../../services/WebSockets/package-lock.json'),
        environment: {
          LOG_LEVEL: props?.logLevel!
        },
        handler: "handler",
        allowAllOutbound: true,
        runtime: Runtime.NODEJS_16_X,
        tracing: Tracing.ACTIVE
      }

      return new NodejsFunction(this, name, {
        ...nodeJsFunctionProps
      });
    }

    const newLamda = (name: string, handler: string, env?: {
      [key: string]: string;
    } | undefined) => {
      return createLambda(this, name, functionsPath, handler, props!.node_env, env);
    }

    // Lambda Functions....
    const authorizerHandler = newLamda('AuthorizerHandler', 'functions/auth.handler');

    const onConnectHandler = newLamda('OnConnectHandler', 'functions/connect.handler', {
      WEBSOCKETS_CONNECTION_TABLE: props!.connectionsTable.tableName
    });
    props?.connectionsTable.grantReadWriteData(onConnectHandler);

    const onDisconnectHandler = newLamda('OnDisconnectHandler', 'functions/disconnect.handler', {
      WEBSOCKETS_CONNECTION_TABLE: props!.connectionsTable.tableName
    });
    props?.connectionsTable.grantReadWriteData(onDisconnectHandler);

    const onMessageHandler = newLamda('OnMessageHandler', 'functions/default.handler');

    const getConnection = newLamda('GetConnection', 'functions/getConnection.handler', {
      WEBSOCKETS_CONNECTION_TABLE: props!.connectionsTable.tableName
    });
    props?.connectionsTable.grantReadWriteData(getConnection);

    const sendMessage = newLamda('SendMessage', 'functions/sendMessage.handler', {
      APIGW_ENDPOINT: '6ii0i7gdbe.apigateway.us-east-1.amazonaws.com/v1' //TODO: deal with this... apigateway.us-east-1.amazonaws.com
    });

    const startSendMessageNotification = newLamda('StartSendMessageNotification', 'functions/startSendMessageNotification.handler')

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
      lambdaFunction: sendMessage
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

    // WebSockets...

    const authorizer = new WebSocketLambdaAuthorizer('Authorizer', authorizerHandler, {
      identitySource: [
        // 'route.request.header.Authorization',          // todo: ??
        'route.request.header.Sec-WebSocket-Protocol']
    });

    this.webSocketApi = new WebSocketApi(this, 'HoleshotWebSocketApi', {
      apiName: 'Holeshot Websocket API',
      connectRouteOptions: { integration: new WebSocketLambdaIntegration("ConnectIntegration", onConnectHandler), authorizer },
      disconnectRouteOptions: { integration: new WebSocketLambdaIntegration("DisconnectIntegration", onDisconnectHandler) },
      defaultRouteOptions: { integration: new WebSocketLambdaIntegration("DefaultIntegration", onMessageHandler) },
    });

    const stage = new WebSocketStage(this, 'Prod', {
      webSocketApi: this.webSocketApi,
      stageName: 'v1',                                    // todo: ??
      autoDeploy: true,
    });

    this.webSocketApi.grantManageConnections(onMessageHandler.role!);
    this.webSocketApi.grantManageConnections(sendMessage.role!);

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
