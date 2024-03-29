import { CfnOutput, Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import { RestApi, LambdaRestApi, ApiKeySourceType } from "aws-cdk-lib/aws-apigateway";
import { AccountRecovery, CfnIdentityPool, CfnIdentityPoolRoleAttachment, StringAttribute, UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Effect, FederatedPrincipal, IRole, Policy, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { Chain, Choice, Condition, Fail, LogLevel, Pass, Result, StateMachine, Succeed } from "aws-cdk-lib/aws-stepfunctions";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { CfnTemplate } from "aws-cdk-lib/aws-ses";
import { VerifySesEmailAddress } from "@seeebiii/ses-verify-identities";
import { BaseServiceConstruct } from "./base-service-construct";
import { addCorsOptions } from ".";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export interface UserServiceStackProps {
  coreTable: Table;
  mediaBucket: Bucket; // Not used atm
  userMediaBucket: Bucket;
  siteUrl: string;
  senderEmail: string;
  node_env: string;
  logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
}

export class UserServiceStack extends BaseServiceConstruct {

  readonly client: UserPoolClient;
  readonly userPool: UserPool;
  readonly restApi: RestApi;
  readonly authProcessedTopic: Topic;

  constructor(scope: Construct, id: string, props?: UserServiceStackProps) {
    super(scope, id, '../../services/User/dist', props!.node_env);

    // Create PostAuthentication Lambda
    //
    const postAuthentication = super.newLambda('PostAuthentication', 'functions/postAuthentication.handler');

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

    const userPoolIdParam = new StringParameter(this, 'Holeshot-UserPoolId', {
      parameterName: '/holeshot/user-pool-id',
      stringValue: this.userPool.userPoolId
    });

    this.client = this.userPool.addClient('Holeshot-client', {
      userPoolClientName: 'Holeshot-client',
      idTokenValidity: Duration.days(1),
      refreshTokenValidity: Duration.days(90),
      accessTokenValidity: Duration.days(1),
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
      },
      preventUserExistenceErrors: true,
      generateSecret: false,
    });


    const identityPool = new CfnIdentityPool(scope, 'MyIdentityPool', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        clientId: this.client.userPoolClientId,
        providerName: this.userPool.userPoolProviderName
      }]
    });

    const identityPoolIdParam = new StringParameter(scope, 'IdentityPoolIdParam', {
      parameterName: '/holeshot/identity-pool-id',
      stringValue: identityPool.ref
    });
    const unauthenticatedRole = new Role(scope, 'DefaultUnauthenticatedRole', {
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        StringEquals: { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
        'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'unauthenticated' }
      }, 'sts:AssumeRoleWithWebIdentity')
    });

    unauthenticatedRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'mobileanalytics:PutEvents',
        'cognito-sync:*'
      ],
      resources: ['*'] // ???
    }));

    const authenticatedRole = new Role(scope, 'DefaultAuthenticatedRole', {
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        StringEquals: { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
        'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'authenticated' }
      }, 'sts:AssumeRoleWithWebIdentity')
    });

    authenticatedRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'mobileanalytics:PutEvents',
        'cognito-sync:*',
        'cognito-identity:*'
      ],
      resources: ['*']
    }));

    new CfnIdentityPoolRoleAttachment(scope, 'MyIdentityPoolRoleAttachment', {
      identityPoolId: identityPool.ref,
      roles: {
        unauthenticated: unauthenticatedRole.roleArn,
        authenticated: authenticatedRole.roleArn
      }
    });

    // Create the rest of the Lambdas
    //
    const register = super.newLambda('RegisterHandler', 'functions/register.handler');

    const getUser = super.newLambda('GetUserHandler', 'functions/getUser.handler', {
      HOLESHOT_CORE_TABLE: props?.coreTable.tableName!
    });
    props?.coreTable.grantReadData(getUser);

    const createUser = super.newLambda('CreateUserHandler', 'functions/createUser.handler', {
      USER_POOL_ID: this.userPool.userPoolId
    });

    const lambdaCognitoAdminCreateUserPolicy = new Policy(this, 'lambdaCognitoAdminCreateUserPolicy');
    lambdaCognitoAdminCreateUserPolicy.addStatements(
      new PolicyStatement({
        actions: [
          "cognito-idp:AdminCreateUser"
        ],
        effect: Effect.ALLOW,
        resources: ['*'],  //TODO: tighten this up...,
        sid: "lambdaCognitoAdminCreateUserPolicy"
      })
    )
    createUser.role?.attachInlinePolicy(lambdaCognitoAdminCreateUserPolicy);

    const saveUser = super.newLambda('SaveUserHandler', 'functions/saveUser.handler', {
      HOLESHOT_CORE_TABLE: props?.coreTable.tableName!
    });
    props?.coreTable.grantReadWriteData(saveUser);

    const sendConfirmation = super.newLambda('SendConfirmation', 'functions/sendConfirmation.handler', {
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
    new VerifySesEmailAddress(this, 'SesEmailVerification-kyle', {
      emailAddress: 'kyle@kylefinley.net'
    });

    new VerifySesEmailAddress(this, 'SesEmailVerification-kyle2', {
      emailAddress: 'rkfinley@gmail.com'
    });

    new VerifySesEmailAddress(this, 'SesEmailVerification-chris', {
      emailAddress: 'chrisfinley77@icloud.com'
    });

    // will add once there's more stuff working...
    // new VerifySesEmailAddress(this, 'SesEmailVerification-jeff', {
    //   emailAddress: 'jeff.madlock@gmail.com'
    // });

    // SNS Topics. Subscriptions added in infrastructure
    //
    this.authProcessedTopic = new Topic(this, 'sns-topic', {
      topicName: 'Holeshot-PostAuthenticationTopic',
      displayName: 'PostAuthenticationTopic',
    });
    this.authProcessedTopic.grantPublish(postAuthentication.role as IRole);


    // Create API Gateway REST api and endpoint for /registration
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
