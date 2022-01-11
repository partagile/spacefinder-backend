import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { v4 } from 'uuid'

const dbClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NlAME

async function handler(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Salut! Bonjour from Dynamodb'
    }

    const item = typeof event.body == 'object'? event.body: JSON.parse(event.body);
    item.spaceId = v4();
    
    try {
        await dbClient.put({
            TableName: TABLE_NAME!,
            Item: item
        }).promise()
    } catch (e: unknown) {
        const error = e as Error;
        result.body = error.message;
    }
    result.body = JSON.stringify(`New item created with id: ${item.spaceId}`)

    return result
}

export { handler };
