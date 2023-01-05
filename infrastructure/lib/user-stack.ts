import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Effect, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { createLambda } from '.';

export interface UserServiceProps {
  coreTable: Table;
  node_env: string;
  logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
}

export class UserService extends Construct {

  constructor(scope: Construct, id: string, props?: UserServiceProps) {
    super(scope, id);


    const functionsPath = '../../services/User/dist';

    const newLamda = (name: string, handler: string, env?: {
      [key: string]: string;
    } | undefined) => {
      return createLambda(this, name, functionsPath, handler, props!.node_env, env);
    }

    const registerHandler = newLamda('RegisterHandler', 'functions/register.handler');

    const getUserHandler = newLamda('GetUserHandler', 'functions/getUser.handler');
    props?.coreTable.grantReadData(getUserHandler);

    const CreateUser = newLamda('CreateUserHandler', 'functions/createUser.handler'); // Create Cognito account)

    const saveUser = newLamda('SaveUserHandler', 'functions/saveUser.handler'); // Save user in DDB
    props?.coreTable.grantReadWriteData(saveUser);

    const sendConfirmation = newLamda('SendConfirmation', 'functions/sendConfirmation.handler');

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
    registerHandler.role?.attachInlinePolicy(lambdaSfnStatusUpdatePolicy);

    // TODO: create new RestApi endpoint for /user/register

    
  }
}
