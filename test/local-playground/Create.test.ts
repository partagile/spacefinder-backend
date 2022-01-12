import { handler } from '../../services/SpacesTable/Create';

const event = {
    body: {
        name: 'NHSC 110 LT',
        location: 'Prince George'
    }
}


const result = handler({} as any, {} as any).then((apiResult)=>{
    const items = JSON.parse(apiResult.body);
    console.log('for debug breakpoint')
});
