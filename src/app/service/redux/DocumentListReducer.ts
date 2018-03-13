import { Action } from '@ngrx/store';

import { DocumentInfo } from '../Interface';

const NEW = '[DOCUMENT_LIST]new';
const MODIFY = '[DOCUMENT_LIST]modify';
const REMOVE = '[DOCUMENT_LIST]remove';
const REMOVE_ALL = '[DOCUMENT_LIST]removeAll';

export class NewDocumentList implements Action {
    type = NEW;
    constructor(public payload: DocumentInfo) {}
}

export class ModifyDocumentList implements Action {
    type = MODIFY;
    constructor(public payload: DocumentInfo) {}
}

export class RemoveDocumentList implements Action {
    type = REMOVE;
    constructor(public payload: DocumentInfo) {}
}

export class RemoveAllDocumentList implements Action {
    type = REMOVE_ALL;
}

const init: DocumentInfo[] = [];

export function Reducer(state = init, action) {
    switch (action.type) {

        case NEW:
            return [...state, action.payload];

        case MODIFY:
            return state.map(value => {
                return value.id === action.payload.id ?
                    Object.assign({}, action.payload) :
                    value;
            });

        case REMOVE:
            return state.filter(value => {
                return value.id !== action.payload.id;
            });

        case REMOVE_ALL:
            return init;

        default:
            return state;
    }
}




