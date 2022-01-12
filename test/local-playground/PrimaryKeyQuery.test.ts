import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../services/SpacesTable/Read';

const event: APIGatewayProxyEvent = {
    queryStringParameters: {
        spaceId: '8bd4a9e4-380a-4b83-bf74-90d3d22d9409'
    }
} as any;

const result = handler(event as any, {} as any).then((apiResult)=>{
    const items = JSON.parse(apiResult.body);
    console.log('for debug breakpoint')
});
