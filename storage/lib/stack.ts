import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

// Import the Storage resource from the Storage file
import { Storage } from "./resources/storage";

/**
 * Properties for defining a Vercel storage stack.
 */
interface IVercelStorageprops extends cdk.StackProps {
  /**
   * The stage of the Vercel storage stack.
   */
  stage: string;
}

/**
 * Defines an AWS CDK stack for deploying Vercel storage resources.
 */
export class VercelStorageStack extends cdk.Stack {
  /**
   * Creates a new Vercel storage stack.
   * @param scope The scope of the construct.
   * @param id The ID of the construct.
   * @param props The properties for defining the Vercel storage stack.
   */
  constructor(scope: Construct, id: string, props: IVercelStorageprops) {
    super(scope, id, props);

    // Get the namespace from the CDK context or use an empty string as default
    const namespace = this.node.tryGetContext("namespace") || "";
   
    // Create a new S3 bucket and serverless Redis with the given namespace and stage
    const storage = new Storage(this, `${namespace}-storage`, {
      prefix: namespace,
      suffix: props.stage
    });
  }
}
