import { CfnOutput, Stack } from "aws-cdk-lib";
import { CloudFrontWebDistribution } from "aws-cdk-lib/aws-cloudfront";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { join } from 'path';


export class WebAppDeployment {

    private stack: Stack;
    private bucketSuffix: string;
    private deploymentBucket: Bucket

    constructor(stack: Stack, bucketSuffix: string){
        this.stack = stack;
        this.bucketSuffix = bucketSuffix;
        this.initialize();
    }

    private initialize(){
        const bucketName = 'spacefinderz-frontend-' + this.bucketSuffix;
        this.deploymentBucket = new Bucket(
            this.stack,
            'spacefinderz-id', {
                bucketName: bucketName,
                publicReadAccess: true,
                websiteIndexDocument: 'index.html'
            }
        );
        new BucketDeployment(
            this.stack,
            'spacefinderz-id-deployment', {
                destinationBucket: this.deploymentBucket,
                sources: [
                    Source.asset(
                        join(__dirname, '..', '..', 'spacefinder-frontend', 'build')
                    )
                ]
            }
        );
        new CfnOutput(this.stack, 'WebAppS3Url', {
            value: this.deploymentBucket.bucketWebsiteUrl
        });

        const cloudFront = new CloudFrontWebDistribution(
            this.stack,
            'spacefinderz-distribution', {
                originConfigs:[
                    {
                        behaviors: [
                            {
                                isDefaultBehavior: true
                            }
                        ],
                        s3OriginSource: {
                            s3BucketSource: this.deploymentBucket
                        }
                    }
                ]
            }
        );
        new CfnOutput(this.stack, 'WebAppCloudFrontUrl', {
            value: cloudFront.distributionDomainName
        })

    }

} 