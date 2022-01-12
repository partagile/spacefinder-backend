import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { MissingFieldError, validateSpaceEntry } from '../Shared/InputValidator'
import { generateRandomId, getEventBody } from '../Shared/Utils'

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
        const item = getEventBody(event);
        item.spaceId = generateRandomId();
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
