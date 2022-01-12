import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { /*LambdaIntegration,*/ RestApi } from 'aws-cdk-lib/aws-apigateway'
import { GenericTable } from './GenericTable'

export class SpaceStack extends Stack {

    private api = new RestApi(this, 'SpaceApi')
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
        
        //spaces API integrations
        const spaceResource = this.api.root.addResource('spaces');
        spaceResource.addMethod('POST', this.spacesTable.createLambdaIntegration);
        spaceResource.addMethod('GET', this.spacesTable.readLambdaIntegration);
        spaceResource.addMethod('PUT', this.spacesTable.updateLambdaIntegration);
        spaceResource.addMethod('DELETE', this.spacesTable.deleteLambdaIntegration);
    }
}
