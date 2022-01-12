import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../services/SpacesTable/Read';

const event: APIGatewayProxyEvent = {
    body: {
        location: 'Victoria'
    }
} as any;


const result = handler(event, {} as any).then((apiResult)=>{
    const items = JSON.parse(apiResult.body);
    console.log('for debug breakpoint')
});
