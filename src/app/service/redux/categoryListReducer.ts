import { Action } from '@ngrx/store';

import { Category } from '../Interface';

const NEW = '[CATEGORY_LIST]new';
const MODIFY = '[CATEGORY_LIST]modify';
const NEW_LIST = '[CATEGORY_LIST]newList';
const REMOVE_ALL = '[CATEGORY_LIST]removeAll';

export class New implements Action {
    type = NEW;
    constructor(public payload) {}
}

export class Modify implements Action {
    type = MODIFY;
    constructor(public payload) {}
}

export class NewList implements Action {
    type = NEW_LIST;
    constructor(public payload) {}
}

export class RemoveAll implements Action {
    type = REMOVE_ALL;
}

const init: Category[] = [];

export function Reducer(state = init, action) {
    switch (action.type) {
        case NEW:
            state.push(action.payload);
            return state;

        case MODIFY:
            return state.map(value => {
                return value._id === action.payload._id ?
                    Object.assign({}, action.payload) : value;
            });

        case NEW_LIST:
            return [...action.payload];

        case REMOVE_ALL:
            return init;

        default:
            return state;
    }
}

