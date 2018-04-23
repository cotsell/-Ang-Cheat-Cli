import { Action } from '@ngrx/store';

import { DocumentInfo, UserInfo } from '../Interface';

const NEW = '[DOCUMENT_LIST]new';
const NEW_LIST = '[DOCUMENT_LIST]newList';
const MODIFY = '[DOCUMENT_LIST]modify';
const REMOVE = '[DOCUMENT_LIST]remove';
const REMOVE_ALL = '[DOCUMENT_LIST]removeAll';
const FILL_USER_INFO = '[DOCUMENT_LIST]fillUserInfo';

export class NewDocument implements Action {
    type = NEW;
    constructor(public payload: DocumentInfo) {}
}

export class NewDocumentList implements Action {
    type = NEW_LIST;
    constructor(public payload: DocumentInfo[]) {}
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

export class FillUserInfo implements Action {
    type = FILL_USER_INFO;
    constructor(public payload: UserInfo[]) {}
}

const init: DocumentInfo[] = [];

export function Reducer(state = init, action) {
    switch (action.type) {

        case NEW:
            return [...state, action.payload];

        case NEW_LIST:
            if (action.payload.length === 0) {
                return init;
            } else {
                return action.payload;
            }

        case MODIFY:
            return state.map(value => {
                return value._id === action.payload._id ?
                    Object.assign({}, action.payload) :
                    value;
            });

        case REMOVE:
            return state.filter(value => {
                return value._id !== action.payload._id;
            });

        case REMOVE_ALL:
            return init;

        case FILL_USER_INFO:
            return state.map(value => {
                return Object.assign({}, value,
                    {
                        userInfo: action.payload.find(article => {
                            return article.id === value.userId ? true : false;
                        })
                    });
            });

        default:
            return state;
    }
}




