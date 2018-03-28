import { Action } from '@ngrx/store';

import { DocumentInfo, Tag } from '../Interface';

const NEW = '[DOCUMENT_DETAIL]new';
const MODIFY = '[DOCUMENT_DETAIL]modify';
const REMOVE = '[DOCUMENT_DETAIL]remove';
const NEW_TAG_ARTICLE = '[DOCUMENT_DETAIL]newTagArticle';
const REMOVE_TAG_ARTICLE = '[DOCUMENT_DETAIL]removeTagArticle';

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

export class AddNewTagArticle implements Action {
    type = NEW_TAG_ARTICLE;
    constructor(public payload: Tag ) {}
}

export class RemoveTagArticle implements Action {
    type = REMOVE_TAG_ARTICLE;
    constructor(public payload: Tag) {}
}

const init: DocumentInfo = undefined;

export function Reducer(state = init, action) {
    switch (action.type) {

        case NEW:

        case MODIFY:
            return Object.assign({}, action.payload);

        case REMOVE:
            return init;

        case NEW_TAG_ARTICLE:
            return Object.assign({}, state, { tagList: [...state.tagList, action.payload] });

        case REMOVE_TAG_ARTICLE:
            return Object.assign(
                {},
                state,
                { tagList: [...state.tagList.filter(value => {
                    return value.title === action.payload.title ?
                        false : true;
                })] }
            );

        default:
            return state;
    }
}




