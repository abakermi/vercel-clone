import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';

/**
 * Properties for defining a storage construct.
 */
interface StorageProps {
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
 * Defines an AWS CDK construct for creating storage resources.
 */
export class Storage extends Construct {
    /**
     * The S3 bucket created by this construct.
     */
    public readonly bucket: s3.IBucket;

    /**
     * Creates a new storage construct.
     * @param scope The scope of the construct.
     * @param id The ID of the construct.
     * @param props The properties for defining the storage construct.
     */
    constructor(scope: Construct, id: string, props: StorageProps) {
        super(scope, id);

        // Environment variables
        const bucketName = process.env.BUCKET_NAME || "vercel-output";
        const vpcId = process.env.VPC_ID || "";

        // Create an S3 bucket
        this.bucket = new s3.Bucket(this, `${props.prefix}-output-bucket-${props.suffix}`, {
            bucketName: `${props.prefix}-${bucketName}-${props.suffix}`,
            removalPolicy: props.suffix === "prod" ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
            // cors: [
            //     {
            //         allowedMethods: [
            //             s3.HttpMethods.HEAD,
            //             s3.HttpMethods.GET,
            //             s3.HttpMethods.PUT,
            //             s3.HttpMethods.POST,
            //             s3.HttpMethods.DELETE
            //         ],
            //         allowedOrigins: ["*"],
            //         allowedHeaders: ["*"],
            //         exposedHeaders: [
            //             "x-amz-server-side-encryption",
            //             "x-amz-request-id",
            //             "x-amz-id-2",
            //             "ETag"
            //         ],
            //         maxAge: 3000
            //     }
            // ]
        });

        // Get VPC by ID
        const vpc = ec2.Vpc.fromLookup(this, `${props.prefix}-vpc-${props.suffix}`, {
            vpcId
        });

        // Define security group for ElastiCache
        const cacheSecurityGroup = new ec2.SecurityGroup(this, `${props.prefix}-cache-redis-${props.suffix}`, {
            vpc,
            securityGroupName: `${props.prefix}-cache-ecs-${props.suffix}`,
            description: 'Security group for ElastiCache to be used in ECS cluster',
        });

        // Allow inbound traffic from a specific VPC CIDR range to ElastiCache
        cacheSecurityGroup.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(6379), 'Allow Redis port');

        // Get private subnets
        const subnets = vpc.privateSubnets.map((s) => s.subnetId);

        // Create a serverless ElastiCache (Redis) cluster
        const cache = new elasticache.CfnServerlessCache(this, `${props.prefix}-serverless-cache`, {
            engine: 'redis',
            serverlessCacheName: `${props.prefix}-serverless-cache`,
            securityGroupIds: [cacheSecurityGroup.securityGroupId],
            subnetIds: subnets
        });

        // Output the bucket name
        new cdk.CfnOutput(this, `bucketName`, {
            value: this.bucket.bucketName
        });

        // Output the cache endpoint address
        new cdk.CfnOutput(this, `cacheEndpoint`, {
            value: cache.attrEndpointAddress
        });
    }
}
