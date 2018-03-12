import { Action } from '@ngrx/store';

import { DocumentInfo } from '../Interface';

const NEW = '[DOCUMENT_DETAIL]new';
const MODIFY = '[DOCUMENT_DETAIL]modify';
const REMOVE = '[DOCUMENT_DETAIL]remove';

export class NewDocumentDetail implements Action {
    type = NEW;
    constructor(public payload: DocumentInfo) {}
}

export class ModifyDocumentDetail implements Action {
    type = MODIFY;
    constructor(public payload: DocumentInfo) {}
}

export class RemoveDocumentDetail implements Action {
    type = REMOVE;
}

const init: DocumentInfo = undefined;

export function Reducer(state = init, action) {
    switch (action.type) {

        case NEW:

        case MODIFY:
            return Object.assign({}, action.payload);

        case REMOVE:
            return init;

        default:
            return state;
    }
}




