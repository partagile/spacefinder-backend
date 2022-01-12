import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { request } from "http";

const dbClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME as string;
const PRIMARY_KEY = process.env.PRIMARY_KEY as string;

async function handler(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Salut! Bonjour from Dynamodb'
    }

    const requestBody = typeof event.body == 'object'? event.body: JSON.parse(event.body);
    const spaceId = event.queryStringParameters?.[PRIMARY_KEY]

    if (requestBody && spaceId) {
        const requestBodyKey = Object.keys(requestBody)[0];
        const requestBodyValue = requestBody[requestBodyKey];

        const updateResult = await dbClient.update({
            TableName: TABLE_NAME,
            Key: {
                [PRIMARY_KEY]: spaceId
            },
            UpdateExpression: 'set #expressionUpdate1 = :expressionValue1',
            ExpressionAttributeValues: {
                ':expressionValue1': requestBodyValue
            },
            ExpressionAttributeNames: {
                '#expressionUpdate1': requestBodyKey
            },
            ReturnValues: 'UPDATED_NEW'
        }).promise();

        result.body = JSON.stringify(updateResult)
    }

    return result
}

export { handler };
