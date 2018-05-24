import { Action } from '@ngrx/store';
import { Account } from '../Interface';

const NEW = '[ACCOUNT]newAccount';
const MODIFY = '[ACCOUNT]modifyAccount';
const REMOVE = '[ACCOUNT]removeAccount';
const MODIFY_STATE = '[ACCOUNT]modifyAccountState';

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

export class ModifyAccountState implements Action {
    type = MODIFY_STATE;
    constructor(public payload: string) {}
}

const init: Account = { accessToken: undefined, loggedIn: false, state: 'none' };

export function Reducer(state = init, action) {
    switch (action.type) {

        case NEW:
            // return Object.assign({}, action.payload);

        case MODIFY:
            return Object.assign({}, state, action.payload);

        case MODIFY_STATE:
            return Object.assign({}, state, { state: action.payload });

        case REMOVE:
            return init;

        default:
            return state;
    }
}
