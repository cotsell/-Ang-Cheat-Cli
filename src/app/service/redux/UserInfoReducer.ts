import { Action } from '@ngrx/store';

import { UserInfo } from '../Interface';

const NEW = '[USERINFO]new';
const MODIFY = '[USERINFO]modify';
const CHANGE_USER_IMG_URL = '[USERINFO]changeUserImgUrl';
const REMOVE = '[USERINFO]remove';

export class NewUserInfo implements Action {
    type = NEW;
    constructor(public payload) {}
}

export class ModifyUserInfo implements Action {
    type = MODIFY;
    constructor(public payload: UserInfo) {}
}

export class ChangeUserImgUrl implements Action {
    type = CHANGE_USER_IMG_URL;
    constructor(public payload: string) {}
}

export class RemoveUserInfo implements Action {
    type = REMOVE;
}

const init: UserInfo = undefined;

export function Reducer(state = init, action) {
    switch (action.type) {
        case NEW:

        case MODIFY:
            return Object.assign({}, state, { ...action.payload });

        case CHANGE_USER_IMG_URL:
            return Object.assign({}, state, { profileImgUrl: action.payload });

        case REMOVE:
            return init;

        default:
            return state;
    }
}
