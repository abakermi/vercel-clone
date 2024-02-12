import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';


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

export class Storage extends Construct {
    public readonly bucket: s3.Bucket

    constructor(scope: Construct, id: string, props: StorageProps) {
        super(scope, id);

        // Environment variables
        const bucketName = process.env.BUCKET_NAME || "vercel-output"

        this.bucket = new s3.Bucket(this, `${props.prefix}-output-bucket-${props.suffix}`, {
            bucketName: `${props.prefix}-${bucketName}-${props.suffix}`,
            removalPolicy: props.suffix === "prod" ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY, publicReadAccess: true,

            cors: [
                {
                    allowedMethods: [
                        s3.HttpMethods.HEAD,
                        s3.HttpMethods.GET,
                        s3.HttpMethods.PUT,
                        s3.HttpMethods.POST,
                        s3.HttpMethods.DELETE
                    ],
                    allowedOrigins: ["*"],
                    allowedHeaders: ["*"],
                    exposedHeaders: [
                        "x-amz-server-side-encryption",
                        "x-amz-request-id",
                        "x-amz-id-2",
                        "ETag"
                    ],
                    maxAge: 3000
                }
            ]
        });
         


        new cdk.CfnOutput(this, `${props.prefix}-output-bucket-name-${props.suffix}`, {
            value: this.bucket.bucketName
        });
    }
}
