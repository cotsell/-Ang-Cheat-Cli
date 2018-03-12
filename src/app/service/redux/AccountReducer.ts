import { Action } from '@ngrx/store';
import { Account } from '../Interface';

const NEW = '[ACCOUNT]newAccount';
const MODIFY = '[ACCOUNT]modifyAccount';
const REMOVE = '[ACCOUNT]removeAccount';

export class NewAccount implements Action {
    type = NEW;
    constructor(public payload: Account) {}
}

export class ModifyAccount implements Action {
    type = MODIFY;
    constructor(public payload: Account) {}
}

export class RemoveAccount implements Action {
    type = REMOVE;
}

const init: Account = { accessToken: undefined, loggedIn: false };

export function Reducer(state = init, action) {
    switch (action.type) {

        case NEW:
            // return Object.assign({}, action.payload);

        case MODIFY:
            return Object.assign({}, action.payload);

        case REMOVE:
            return init;

        default:
            return state;
    }
}
