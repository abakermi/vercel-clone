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
 * Import Storage  stack
 */

import { VercelStorageStack } from '../lib/stack';

/**
 * The AWS CDK application instance.
 */
const app = new cdk.App();

/**
 * Create the ECS stack 
 */
new VercelStorageStack(app, 'VercelStorageStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT || "", region: process.env.CDK_DEFAULT_REGION || "" },
  stage: process.env.CDK_DEPLOY_STAGE || "dev",
  description: "The Storage resources for vercel clone",
});