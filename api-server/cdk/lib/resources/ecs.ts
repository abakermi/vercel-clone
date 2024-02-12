import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';

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
        const bucketName = process.env.BUCKET_NAME || ""
        const bucketArn = process.env.BUCKET_ARN || ""
        const cacheHost = process.env.CACHE_HOST || ""
        const cachePort = process.env.CACHE_PORT || ""

        let containerEnvs = {}

        let vpc;
        let bucket;

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

        // lookup bucket 
        if (bucketName !== "") {
            bucket = s3.Bucket.fromBucketAttributes(this, `${props.prefix}-bucket-${props.suffix}`, {
                bucketName: bucketName
            })
        }

        containerEnvs = cacheHost !== "" ? { ...containerEnvs, CACHE_HOST: cacheHost }
            : containerEnvs
        containerEnvs = cachePort !== "" ? { ...containerEnvs, CACHE_PORT: cachePort }
            : containerEnvs
        containerEnvs = bucket ? { ...containerEnvs, BUCKET_NAME: bucketName } : containerEnvs

        // Add The builder container
        taskDefinition.addContainer(`tasks-${props.suffix}`, {
            image: ecs.ContainerImage.fromEcrRepository(ecrRepo, ecrRepoTag),
            containerName: "builder-image",
            environment: containerEnvs
        });

        // Add the S3 policy to the task role
        if (bucket) {
            taskDefinition.addToTaskRolePolicy(new iam.PolicyStatement({
                actions: ['s3:*'],
                resources: [bucket.bucketArn],
            }));
        }


        // Output the newly created task definition ARN
        new cdk.CfnOutput(this, "newTaskDefArn", {
            value: taskDefinition.taskDefinitionArn
        });

        // Output the newly created service name
        new cdk.CfnOutput(this, "newSvcName", {
            value: service.serviceName
        });

        // Output the newly cluster name
        new cdk.CfnOutput(this, "newClusterName", {
            value: cluster.clusterName
        });

        // Output the newly cluster arn
        new cdk.CfnOutput(this, "newClusterArn", {
            value: cluster.clusterArn
        });
        // used subnets
        new cdk.CfnOutput(this, "subnets", {
            value: `${vpc.privateSubnets.map((e) => e.subnetId).join(",")},
            ${vpc.publicSubnets.map((e) => e.subnetId).join(",")}`
        });

        new cdk.CfnOutput(this, "securityGroups", {
            value: `${service.connections.securityGroups.map((e) => e.securityGroupId).join(",")}`
        });


    }
}
