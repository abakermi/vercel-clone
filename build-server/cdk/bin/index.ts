'#!/usr/bin/env node'


/**
 * Enable support for source maps.
 */
import 'source-map-support/register';

/**
 * Import AWS CDK modules.
 */
import * as cdk from 'aws-cdk-lib';

/**
 * Import ECR stack
 */

import { EcrBuilderStack } from '../lib/stack';

/**
 * The AWS CDK application instance.
 */
const app = new cdk.App();

/**
 * Create the ECR stack 
 */
new EcrBuilderStack(app, 'EcrBuilderStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT || "", region: process.env.CDK_DEFAULT_REGION || "" },
  stage: process.env.CDK_DEPLOY_STAGE || "dev",
  description: "The ECR repository for the vercel clone application",
});