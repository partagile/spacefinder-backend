import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResult, Context } from "aws-lambda";
import { addCorsHeader } from "../Shared/Utils";

const dbClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;

async function handler(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: ''
    }
    addCorsHeader(result);

    if (isAuthorized(event)) {
        try {
            if (event.queryStringParameters) {
                if (PRIMARY_KEY! in event.queryStringParameters) {
                    result.body = await queryWithPrimaryPartitionKey(event.queryStringParameters)
                }
                else {
                    result.body = await queryWithSecondaryPartitionKey(event.queryStringParameters);
                }
            } else {
                result.body = await scanTable();
            }
    
        } catch (error) {
            result.body = error.message;
        }
    } else {
        return {
            statusCode: 401,
            body: JSON.stringify('Unauthorized')
        }
    }


    return result
}

async function queryWithPrimaryPartitionKey(queryParams: APIGatewayProxyEventQueryStringParameters) {
    const keyParam = queryParams[PRIMARY_KEY!];
    const queryResponse = await dbClient.query({
        TableName: TABLE_NAME!,
        KeyConditionExpression: '#expression1 = :expressionValue1',
        ExpressionAttributeNames: {
            '#expression1': PRIMARY_KEY!
        },
        ExpressionAttributeValues: {
            ':expressionValue1': keyParam
        }
    }).promise();
    return JSON.stringify(queryResponse.Items)
}

async function queryWithSecondaryPartitionKey(queryParams: APIGatewayProxyEventQueryStringParameters) {
    const queryKey = Object.keys(queryParams)[0];
    const queryValue = queryParams[queryKey];
    const queryResponse = await dbClient.query({
        TableName: TABLE_NAME!,
        IndexName: queryKey,
        KeyConditionExpression: '#expression1 = :expressionValue1',
        ExpressionAttributeNames: {
            '#expression1': queryKey
        },
        ExpressionAttributeValues: {
            ':expressionValue1': queryValue
        }
    }).promise();
    return JSON.stringify(queryResponse.Items);
}

async function scanTable() {
    const queryResponse = await dbClient.scan({
        TableName: TABLE_NAME!
    }).promise()
    return JSON.stringify(queryResponse.Items)
}

function isAuthorized(event: APIGatewayProxyEvent){
    const groups = event.requestContext.authorizer?.claims['cognito:groups'];
    if (groups) {
        return (groups as string).includes('admins')
    } else {
        return false
    }
}

export { handler };
