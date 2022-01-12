import { Space } from './Model'

export class MissingFieldError extends Error { }

export function validateSpaceEntry(arg: any) {
    if (!(arg as Space).name) {
        throw new MissingFieldError('Name is missing')
    }
    if (!(arg as Space).location) {
        throw new MissingFieldError('Location is missing')
    }
    if (!(arg as Space).spaceId) {
        throw new MissingFieldError('spaceId is missing')
    }
}