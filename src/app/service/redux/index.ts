import * as Interface from '../Interface';
import { Reducer as accountReducer } from './AccountReducer';
import { Reducer as userInfoReducer } from './UserInfoReducer';
import { Reducer as documentDetailReducer } from './DocumentDetailReducer';
import { Reducer as documentListReducer } from './DocumentListReducer';
import { Reducer as categoryListReducer } from './categoryListReducer';

export interface StoreInfo {
    account: Interface.Account;
    userInfo: Interface.UserInfo;
    documentDetail: Interface.DocumentInfo;
    documentList: Interface.DocumentInfo[];
    categoryList: Interface.Category[];
}


export function getReducers() {
    return {
        account: accountReducer,
        userInfo: userInfoReducer,
        documentDetail: documentDetailReducer,
        documentList: documentListReducer,
        categoryList: categoryListReducer,
    };
}

export function getAccount(state: StoreInfo): Interface.Account {
    return state.account;
}

export function getUserInfo(state: StoreInfo): Interface.UserInfo {
    return state.userInfo;
}

export function getDocumentDetail(state: StoreInfo): Interface.DocumentInfo {
    return state.documentDetail;
}

export function getDocumentList(state: StoreInfo): Interface.DocumentInfo[] {
    return state.documentList;
}

export function getCategoryList(state: StoreInfo): Interface.Category[] {
    return state.categoryList;
}
