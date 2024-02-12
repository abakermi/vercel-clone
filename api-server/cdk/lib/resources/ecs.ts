import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';

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
    /**
     * The arn of the S3 bucket.
     */
    bucketArn: string;

    /**
     * The anem of the S3 bucket.
     */
    bucketName:string
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

        // Define security group for ElastiCache
        const cacheSecurityGroup = new ec2.SecurityGroup(this, `${props.prefix}-cache-redis-${props.suffix}`, {
            vpc,
            securityGroupName: `${props.prefix}-cache-ecs-${props.suffix}`,
            description: 'Security group for ElastiCache to be used in ECS cluster',
        });

        // Allow inbound traffic from a specific VPC CIDR range
        cacheSecurityGroup.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(6379), 'Allow Redis port');


        
        const subnets=vpc.privateSubnets.map((s)=>s.subnetId)
        const cache = new cdk.aws_elasticache.CfnServerlessCache(this, `${props.prefix}-serverless-cache`, {
            engine: 'redis',
            serverlessCacheName: `${props.prefix}-serverless-cache`,
            securityGroupIds: [cacheSecurityGroup.securityGroupId],
            subnetIds:subnets
        })

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
                CACHE_HOST: cache?.attrEndpointAddress,
                CACHE_PORT: cache?.attrEndpointPort,
                BUCKET_NAME: props.bucketName
            }
        });

        // Add the S3 policy to the task role
        taskDefinition.addToTaskRolePolicy(new iam.PolicyStatement({
            actions: ['s3:*'],
            resources: [props.bucketArn],
        }));

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

        // Output cache endpoint
        new cdk.CfnOutput(this, "cacheEndpoint", {
            value: cache.attrEndpointAddress
        });
    }
}
