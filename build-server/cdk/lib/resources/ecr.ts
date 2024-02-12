import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

/**
 * Properties for defining an ECR (Elastic Container Registry) stack.
 */
interface EcrProps {
    /**
     * The prefix to use for naming resources.
     */
    prefix: string;
    /**
     * The suffix to use for naming resources.
     */
    suffix: string;
}

/**
 * Defines an AWS CDK stack for creating ECR (Elastic Container Registry) for builder server.
 */
export class Ecr extends Construct {
    /**
     * The ECR repository for builder servers.
     */
    public readonly repositoryBuildServer: ecr.Repository;

    /**
     * Creates a new ECR stack.
     * @param scope The scope of the construct.
     * @param id The ID of the construct.
     * @param props The properties for defining the ECR stack.
     */
    constructor(scope: Construct, id: string, props: EcrProps) {
        super(scope, id);

        // Create an ECR repository for the builder server
        this.repositoryBuildServer = new ecr.Repository(this, `${props.prefix}-repos-server-${props.suffix}`, {
            repositoryName: `${props.prefix}-server-${props.suffix}`
        });

        // Add an output for the tasks repository URI
        new cdk.CfnOutput(this, "reposServerUri", { value: this.repositoryBuildServer.repositoryUri, exportName: "builderServerUri" });
        new cdk.CfnOutput(this, "reposServerName", { value: this.repositoryBuildServer.repositoryName, exportName: "builderServerRepoName" });
    }
}
