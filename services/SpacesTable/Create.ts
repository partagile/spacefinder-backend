import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { MissingFieldError, validateSpaceEntry } from '../Shared/InputValidator'
import { v4 } from 'uuid'

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
        const item = typeof event.body == 'object'? event.body: JSON.parse(event.body);
        item.spaceId = v4();
        validateSpaceEntry(item);

        await dbClient.put({
            TableName: TABLE_NAME!,
            Item: item
        }).promise()
        result.body = JSON.stringify(`New item created with id: ${item.spaceId}`)
    } catch (e: unknown) {
        const error = e as Error;

        if (error instanceof MissingFieldError) {
            result.statusCode = 403
        } else {
            result.statusCode = 500;
        }
        
        result.body = error.message;
    }


    return result
}

export { handler };
