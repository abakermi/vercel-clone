import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

// Import the ApiEcs resource from the Ecs file
import { ApiEcs } from "./resources/ecs";

/**
 * Properties for defining an ECS API stack.
 */
interface IEcsApi extends cdk.StackProps {
  /**
   * The stage of the ECS API stack.
   */
  stage: string;
}

/**
 * Defines an AWS CDK stack for deploying an ECS (Elastic Container Service) API.
 */
export class EcsApiStack extends cdk.Stack {
  /**
   * Creates a new ECS API stack.
   * @param scope The scope of the construct.
   * @param id The ID of the construct.
   * @param props The properties for defining the ECS API stack.
   */
  constructor(scope: Construct, id: string, props: IEcsApi) {
    super(scope, id, props);

    // Get the namespace from the CDK context or use "api" as default
    const namespace = this.node.tryGetContext("namespace") || "api";
   

    // Create a new ECS API stack with the given namespace and stage
    new ApiEcs(this, `${namespace}-api-ecs`, {
      prefix: namespace,
      suffix: props.stage
    });
  }
}
