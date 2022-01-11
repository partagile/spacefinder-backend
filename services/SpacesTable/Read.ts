import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

const dbClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME

async function handler(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Salut! Bonjour from Dynamodb'
    }

    try {
        const queryResponse = await dbClient.scan({
            TableName: TABLE_NAME!
        }).promise()
        result.body = JSON.stringify(queryResponse)
    } catch (e: unknown) {
        const error = e as Error;
        result.body = error.message;
    }
    return result
}

export { handler };
