import { handler } from '../../services/SpacesTable/Create';

const event = {
    body: {
        location: 'Prince George'
    }
}


handler(event as any, {} as any);
