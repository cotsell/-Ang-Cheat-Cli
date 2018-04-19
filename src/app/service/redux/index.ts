import * as Interface from '../Interface';
import { Reducer as accountReducer } from './AccountReducer';
import { Reducer as userInfoReducer } from './UserInfoReducer';
import { Reducer as documentDetailReducer } from './DocumentDetailReducer';
import { Reducer as documentListReducer } from './DocumentListReducer';

export interface StoreInfo {
    account: Interface.Account;
    userInfo: Interface.UserInfo;
    documentDetail: Interface.DocumentInfoForRedux;
    documentList: Interface.DocumentInfo[];
}


export function getReducers() {
    return {
        account: accountReducer,
        userInfo: userInfoReducer,
        documentDetail: documentDetailReducer,
        documentList: documentListReducer
    };
}

export function getAccount(state: StoreInfo): Interface.Account {
    return state.account;
}

export function getUserInfo(state: StoreInfo): Interface.UserInfo {
    return state.userInfo;
}

export function getDocumentDetail(state: StoreInfo): Interface.DocumentInfoForRedux {
    return state.documentDetail;
}

export function getDocumentList(state: StoreInfo): Interface.DocumentInfo[] {
    return state.documentList;
}
