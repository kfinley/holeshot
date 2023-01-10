#!/usr/bin/env node
import 'dotenv/config'
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib';
// import { Aspects } from 'aws-cdk-lib';
// import { AwsSolutionsChecks } from 'cdk-nag';

const LOG_LEVEL: "DEBUG" | "INFO" | "WARN" | "ERROR" = "ERROR";

const app = new cdk.App();

// CDK-NAG security checks
//Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))

const infraStack = new InfrastructureStack(app, `HoleshotBMX-Infrastructure`, {
  senderEmail: process.env.SES_SENDER_EMAIL!,
  logLevel: LOG_LEVEL,
  node_env: process.env.NODE_ENV!,
  env: {
    account: process.env.AWS_ACCOUNT,
    region: process.env.AWS_REGION,
  },
});
