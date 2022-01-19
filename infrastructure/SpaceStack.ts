import { CfnOutput, Fn, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import {  AuthorizationType, Cors, MethodOptions, ResourceOptions, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { GenericTable } from './GenericTable'
import { AuthorizerWrapper } from './auth/AuthorizerWrapper'
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3'
import { WebAppDeployment } from './WebAppDeployment'

export class SpaceStack extends Stack {

    private api = new RestApi(this, 'SpaceApi');
    private authorizer: AuthorizerWrapper;
    private suffix: string;
    private photosBucket: Bucket


    private spacesTable = new GenericTable(this, {
        tableName: 'SpacesTable',
        primaryKey: 'spaceId',
        createLambdaPath: 'Create',
        readLambdaPath: 'Read',
        updateLambdaPath: 'Update',
        deleteLambdaPath: 'Delete',
        secondaryIndexes: ['location']
    })

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props)

        this.initializeSuffix();
        this.initializeSpacesPhotosBucket();
        this.authorizer = new AuthorizerWrapper(
            this, 
            this.api,
            this.photosBucket.bucketArn + '/*');

        new WebAppDeployment(this, this.suffix);

        const optionsAuthorizer: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: this.authorizer.authorizer.authorizerId
            }
        }

        const optionsWithCors:ResourceOptions = {
            defaultCorsPreflightOptions : {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS
            }
        } 
        
        //spaces API integrations
        const spaceResource = this.api.root.addResource('spaces', optionsWithCors);
        spaceResource.addMethod('POST', this.spacesTable.createLambdaIntegration, optionsAuthorizer);
        spaceResource.addMethod('GET', this.spacesTable.readLambdaIntegration, optionsAuthorizer );
        spaceResource.addMethod('PUT', this.spacesTable.updateLambdaIntegration, optionsAuthorizer);
        spaceResource.addMethod('DELETE', this.spacesTable.deleteLambdaIntegration, optionsAuthorizer);
    }

    private initializeSuffix(){
        // e.g. arn:aws:cloudformation:us-west-2:029174739700:stack/SpaceFinder/104a01d0-71ce-11ec-86c4-024df7423f65
        const shortStackId = Fn.select(2, Fn.split('/', this.stackId));
        const Suffix = Fn.select(4, Fn.split('-', shortStackId));
        this.suffix = Suffix;
    }

    private initializeSpacesPhotosBucket(){
        this.photosBucket = new Bucket(this, 'spacefinderz-photos', {
            bucketName: 'spacefinderz-photos-' + this.suffix,
            cors: [{
                allowedMethods: [
                    HttpMethods.HEAD,
                    HttpMethods.PUT,
                    HttpMethods.GET,
                    HttpMethods.POST,
                    HttpMethods.DELETE
                ],
                allowedOrigins: ['*'],
                allowedHeaders: ['*']
            }]
        });
        new CfnOutput (this, 'PhotosBucketName', {
            value: this.photosBucket.bucketName
        })
    }
}
