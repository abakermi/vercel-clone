import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

// Import the Ecr class from the Ecr file
import { Ecr } from "./resources/ecr";

/**
 * Properties for defining an ECR Builder Stack.
 */
interface IEcrBuilder extends cdk.StackProps {
  /**
   * The stage of the ECR Builder Stack.
   */
  stage: string;
}

/**
 * Defines an AWS CDK stack for building an ECR (Elastic Container Registry).
 */
export class EcrBuilderStack extends cdk.Stack {
  /**
   * Creates a new ECR Builder Stack.
   * @param scope The scope of the construct.
   * @param id The ID of the construct.
   * @param props The properties for defining the ECR Builder Stack.
   */
  constructor(scope: Construct, id: string, props: IEcrBuilder) {
    super(scope, id, props);

    // Get the namespace from the CDK context or use "api" as default
    const namespace = this.node.tryGetContext("namespace") || "api";

    // Create a new ECR stack with the given namespace and stage
    new Ecr(this, `${namespace}-ecr`, {
      prefix: namespace,
      suffix: props.stage
    });
  }
}
