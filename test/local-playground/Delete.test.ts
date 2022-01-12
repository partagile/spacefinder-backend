import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../services/SpacesTable/Delete';

const event: APIGatewayProxyEvent = {
    queryStringParameters: {
        spaceId: 'f82b3cc2-6447-44be-8688-2cc7ad8c50bf'
    },

} as any;


const result = handler(event as any, {} as any).then((apiResult)=>{
    const items = JSON.parse(apiResult.body);
    console.log('for debug breakpoint')
});
