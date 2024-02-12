import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

/**
 * Properties for defining an API ECS (Elastic Container Service) stack.
 */
interface ApiEcsProps {
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
 * Defines an AWS CDK construct for creating an API with ECS (Elastic Container Service).
 */
export class ApiEcs extends Construct {
    /**
     * Creates a new API ECS stack.
     * @param scope The scope of the construct.
     * @param id The ID of the construct.
     * @param props The properties for defining the API ECS stack.
     */
    constructor(scope: Construct, id: string, props: ApiEcsProps) {
        super(scope, id);

        // Environment variables
        const vpcCidr = process.env.VPC_CIDR || "20.0.0.0/16";
        const vpcId = process.env.VPC_ID || "";
        const fCpu = process.env.FARGATE_CPU_SPEC || ""
        const fMem = process.env.FARGATE_MEM_SPEC || ""
        const ecrRepoName = process.env.ECR_REPO_NAME || ""
        const ecrRepoTag = process.env.ECR_REPO_TAG || ""

        let vpc;

        // If VPC ID is provided, use existing VPC. Otherwise, create a new VPC.
        if (vpcId !== "") {
            vpc = ec2.Vpc.fromLookup(this, `${props.prefix}-vpc-${props.suffix}`, {
                vpcId
            });
        } else {
            vpc = new ec2.Vpc(this, `${props.prefix}-vpc-${props.suffix}`, {
                vpcName: `${props.prefix}-vpc-${props.suffix}`,
                cidr: vpcCidr,
                natGateways: 1,
                maxAzs: 2,
                subnetConfiguration: [
                    {
                        name: `${props.prefix}-subnet-private-${props.suffix}`,
                        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                        cidrMask: 24,
                    },
                    {
                        name: `${props.prefix}-subnet-public-${props.suffix}`,
                        subnetType: ec2.SubnetType.PUBLIC,
                        cidrMask: 24,
                    }
                ],
            });
        }

        // lokup ecr repo
        const ecrRepo = ecr.Repository.fromRepositoryName(this, `${props.prefix}-repo-${props.suffix}`, ecrRepoName)


        // Create ECS cluster
        const cluster = new ecs.Cluster(this, `${props.prefix}-ecs-cluster-${props.suffix}`, {
            vpc: vpc,
            clusterName: `${props.prefix}-cluster-${props.suffix}`,
            containerInsights: false,
        });

        // Create ECS task definition
        const taskDefinition = new ecs.TaskDefinition(this, `${props.prefix}-task-def-${props.suffix}`, {
            compatibility: ecs.Compatibility.FARGATE,
            cpu: fCpu,
            memoryMiB: fMem,
        });

        // Create ECS service
        const service = new ecs.FargateService(this, `${props.prefix}-service-${props.suffix}`, {
            cluster,
            taskDefinition,
            serviceName: `${props.prefix}-api-${props.suffix}`,
        });

        // Add The builder container
        taskDefinition.addContainer(`tasks-${props.suffix}`, {
            image: ecs.ContainerImage.fromEcrRepository(ecrRepo, ecrRepoTag),
            containerName: "builder-image",
            environment: { // Set environment variables for the container

            }
        });

        // Output the newly created task definition ARN
        new cdk.CfnOutput(this, "newTaskDefArn", {
            value: taskDefinition.taskDefinitionArn
        });

        // Output the newly created service name
        new cdk.CfnOutput(this, "newSvcName", {
            value: service.serviceName
        });
    }
}
