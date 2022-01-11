import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { v4 } from 'uuid'

const dbClient = new DynamoDB.DocumentClient();

async function handler(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Salut! Bonjour from Dynamodb'
    }

    const item = {
        spaceId: v4()
    }
    
    try {
        await dbClient.put({
            TableName: 'SpacesTable',
            Item: item
        }).promise()
    } catch (e: unknown) {
        const error = e as Error;
        result.body = error.message;
    }

    return result
}

export { handler };
