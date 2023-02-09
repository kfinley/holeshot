import { CfnOutput, Duration, RemovalPolicy } from "aws-cdk-lib";
import { LambdaIntegration, RestApi, LambdaRestApi, ApiKeySourceType } from "aws-cdk-lib/aws-apigateway";
import { AccountRecovery, StringAttribute, UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Effect, IRole, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { Chain, Choice, Condition, Fail, LogLevel, Pass, Result, StateMachine, Succeed } from "aws-cdk-lib/aws-stepfunctions";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { createLambda, addCorsOptions } from '.';
import { CfnTemplate } from "aws-cdk-lib/aws-ses";
import { VerifySesEmailAddress } from "@seeebiii/ses-verify-identities";

export interface UserServiceStackProps {
  coreTable: Table;
  siteUrl: string;
  senderEmail: string;
  node_env: string;
  logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
}

export class UserServiceStack extends Construct {

  readonly client: UserPoolClient;
  readonly userPool: UserPool;
  readonly restApi: RestApi;

  constructor(scope: Construct, id: string, props?: UserServiceStackProps) {

    super(scope, id);

    const functionsPath = '../../services/User/dist';

    const newLamda = (name: string, handler: string, env?: {
      [key: string]: string;
    } | undefined) => {
      return createLambda(this, name, functionsPath, handler, props!.node_env, env);
    }

    // Create PostAuthentication Lambda
    //
    const postAuthentication = newLamda('PostAuthentication', 'functions/postAuthentication.handler');

    // Cognito User Pool and Client
    //
    this.userPool = new UserPool(this, 'Holeshot-Users', {
      userPoolName: 'Holeshot-Users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      lambdaTriggers: {
        postAuthentication,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        country: new StringAttribute({ mutable: true }),
        city: new StringAttribute({ mutable: true }),
        isAdmin: new StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 6,
        requireLowercase: true,
        requireDigits: true,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.DESTROY,           // TODO.....
    });

    this.client = this.userPool.addClient('Holeshot-client', {
      userPoolClientName: 'Holeshot-client',
      idTokenValidity: Duration.days(1),
      accessTokenValidity: Duration.days(1),
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
      },
      preventUserExistenceErrors: true,
      generateSecret: false,
    });

    // Create the rest of the Lambdas
    //
    const register = newLamda('RegisterHandler', 'functions/register.handler');

    const getUser = newLamda('GetUserHandler', 'functions/getUser.handler', {
      HOLESHOT_CORE_TABLE: props?.coreTable.tableName!
    });
    props?.coreTable.grantReadData(getUser);

    const createUser = newLamda('CreateUserHandler', 'functions/createUser.handler', {
      USER_POOL_ID: this.userPool.userPoolId
    });

    const lambdaCognitoAdmintCreateUserPolicy = new Policy(this, 'lambdaCognitoAdminCreateUserPolicy');
    lambdaCognitoAdmintCreateUserPolicy.addStatements(
      new PolicyStatement({
        actions: [
          "cognito-idp:AdminCreateUser"
        ],
        effect: Effect.ALLOW,
        resources: ['*'],  //TODO: tighten this up...,
        sid: "LambdaCognitoAdmintCreateUserPolicy"
      })
    )
    createUser.role?.attachInlinePolicy(lambdaCognitoAdmintCreateUserPolicy);

    const saveUser = newLamda('SaveUserHandler', 'functions/saveUser.handler', {
      HOLESHOT_CORE_TABLE: props?.coreTable.tableName!
    });
    props?.coreTable.grantReadWriteData(saveUser);

    const sendConfirmation = newLamda('SendConfirmation', 'functions/sendConfirmation.handler', {
      HOLESHOT_SITE_URL: props?.siteUrl!,
      HOLESHOT_SENDER_EMAIL: props?.senderEmail!,
      HOLESHOT_CONFIRMATION_EMAIL_TEMPLATE: 'ConfirmRegistration'
    });

    const lambdaSesSendTemplatedEmailPolicy = new Policy(this, 'lambdaSesSendTemplatedEmailPolicy');
    lambdaSesSendTemplatedEmailPolicy.addStatements(
      new PolicyStatement({
        actions: [
          'ses:SendTemplatedEmail'
        ],
        effect: Effect.ALLOW,
        resources: ['*'],  //TODO: tighten this up...
        sid: 'LambdaSesSendTemplatedEmailPolicy'
      })
    );
    sendConfirmation.role?.attachInlinePolicy(lambdaSesSendTemplatedEmailPolicy);

    // TODO: smells... move this to a shared policy import
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
    register.role?.attachInlinePolicy(lambdaSfnStatusUpdatePolicy);

    // SES
    //
    const confirmRegistrationTemplate = require("../../email-templates/ConfirmRegistration.json");

    const cfnTemplate = new CfnTemplate(this, 'ConfirmRegistration-SES-Template', /* all optional props */ {
      template: {
        subjectPart: 'Confirm Holeshot-BMX Account',
        htmlPart: confirmRegistrationTemplate.Body.Html.Data,
        templateName: 'ConfirmRegistration',
        textPart: confirmRegistrationTemplate.Body.Text.Data,
      },
    });

    //TODO: update this as soon as we have domain email working
    new VerifySesEmailAddress(this, 'SesEmailVerification', {
      emailAddress: 'kyle@kylefinley.net'
    });

    // SNS Topics & Subs
    //
    const authProcessedTopic = new Topic(this, 'sns-topic', {
      topicName: 'Holeshot-PostAuthenticationTopic',
      displayName: 'PostAuthenticationTopic',
    });
    authProcessedTopic.grantPublish(postAuthentication.role as IRole);

    // Create API Gateway REST api and endpiont for /registration
    //

    this.restApi = new LambdaRestApi(this, 'HoleshotApi', {
      description: 'Holeshot BMX api gateway',
      handler: register,
      apiKeySourceType: ApiKeySourceType.HEADER,
      restApiName: 'HoleshotApi',
      deployOptions: { stageName: props!.node_env === 'production' ? 'v1' : 'dev', },
      defaultMethodOptions: {
        apiKeyRequired: false
      },
      proxy: false
    });

    // this.restApi = new RestApi(this, 'HoleshotApi', {
    //   description: 'Holeshot BMX api gateway',
    //   deployOptions: {
    //     stageName: props!.node_env === 'production' ? 'v1' : 'dev',
    //   },
    //   // defaultCorsPreflightOptions: {
    //   //   allowHeaders: [
    //   //     'Content-Type',
    //   //     'X-Amz-Date',
    //   //     'Authorization',
    //   //     'X-Api-Key',
    //   //   ],
    //   //   allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    //   //   allowCredentials: true,
    //   //   allowOrigins: ['https://holeshot-bmx.com'], // [props!.node_env === 'production' ? 'https://holeshot-bmx.com' : 'http://dev.holeshot-bmx.com'],
    //   // }
    // });

    const registration = this.restApi.root
      .addResource('user')
      .addResource('register');

    registration.addMethod(
      'POST', undefined
      // new LambdaIntegration(register, { proxy: true }),
    );

    addCorsOptions(registration);

    // Step Functions...
    //
    const getUserInvocation = new LambdaInvoke(this, "GetUserInvocation", {
      lambdaFunction: getUser,
      outputPath: '$.Payload',
    });

    const createUserInvocation = new LambdaInvoke(this, "CreateUserInvocation", {
      lambdaFunction: createUser,
      outputPath: '$.Payload',
    });

    const saveUserInvocation = new LambdaInvoke(this, "SaveUserInvocation", {
      lambdaFunction: saveUser,
      outputPath: '$.Payload'
    })

    const sendConfirmationInvocation = new LambdaInvoke(this, 'SendConfirmationInvocation', {
      lambdaFunction: sendConfirmation,
      outputPath: '$.Payload'
    })
    const success = new Succeed(this, "Success");

    const chain = Chain
      .start(getUserInvocation)
      .next(
        new Choice(this, 'UserExists?')
          .when(Condition.isPresent('$.userId'),
            new Pass(this, "UserAlreadyExists", {
              result: Result.fromString("User already exists")
            }).next(
              success))
          .otherwise(createUserInvocation
            .next(
              new Choice(this, 'UserCreated?')
                .when(Condition.booleanEquals('$.success', true),
                  saveUserInvocation.next(
                    new Choice(this, 'UserSaved?')
                      .when(Condition.booleanEquals('$.success', true),
                        sendConfirmationInvocation.next(
                          new Choice(this, 'ConfirmationSent?')
                            .when(Condition.booleanEquals('$.success', true),
                              success)
                            .otherwise(new Fail(this, 'SendConfirmationFailed', { error: "Failed to send confirmation email" }))
                        ))
                      .otherwise(new Fail(this, 'SaveUserFailed', { error: "Failed to save user" })),
                  ))
                .otherwise(new Fail(this, "CreateUserFailed", { error: "Failed to create user" })))));

    const stateMachine = new StateMachine(this, 'Holeshot-User-Register', {
      stateMachineName: 'Holeshot-User-Register',
      definition: chain,
      logs: {
        destination: new LogGroup(this, "Register-SFN-Log", {
          logGroupName: "Holeshot-User-Register-StepFunction",
          removalPolicy: RemovalPolicy.DESTROY,
          retention: RetentionDays.ONE_WEEK
        }),
        includeExecutionData: true,
        level: LogLevel.ALL
      }
    });

    new CfnOutput(this, 'StateMachineArn', {
      value: `Register StateMachine arn: ${stateMachine.stateMachineArn}`
    });

    const sfnLambdaInvokePolicy = new Policy(this, 'sfnLambdaInvokePolicy');
    sfnLambdaInvokePolicy.addStatements(
      new PolicyStatement({
        actions: [
          "lambda:InvokeFunction"
        ],
        effect: Effect.ALLOW,
        resources: [`${register.functionArn}:$LATEST`],
        sid: "sfnLambdaInvokePolicy"
      })
    )
    stateMachine.role.attachInlinePolicy(sfnLambdaInvokePolicy)

    // Step Functions end...

  }
}
