export const SERVER_ADDRESS = 'http://localhost:8010';

// Account
export const SIGNUP = SERVER_ADDRESS + '/account/signup';
export const LOGIN = SERVER_ADDRESS + '/account/login';
export const CHECK_ACCESS_TOKEN = SERVER_ADDRESS + '/account/check';

// Account
export const NEW_USER = SERVER_ADDRESS + '/account/user/new';
export const GET_USER = SERVER_ADDRESS + '/account/user';
export const GET_USERS = SERVER_ADDRESS + '/account/users';
export const MODIFY_USER = SERVER_ADDRESS + '/account/user/modify';
export const REMOVE_USER = SERVER_ADDRESS + '/account/user/remove';

// Document
const DOCUMENT = '/document';
export const NEW_DOCUMENT = SERVER_ADDRESS + DOCUMENT + '/new';
export const GET_DOCUMENT = SERVER_ADDRESS + DOCUMENT + '/documentOne';
export const MODIFY_DOCUMENT = SERVER_ADDRESS + DOCUMENT + '/modify';
export const REMOVE_DOCUMENT = SERVER_ADDRESS + DOCUMENT + '/remove';

export const GET_USER_DOCUMENT_LIST = SERVER_ADDRESS + DOCUMENT + '/userDocumentList';
export const SEARCH_DOCUMENT = SERVER_ADDRESS + '/search';

// Tag
export const NEW_TAG = SERVER_ADDRESS + DOCUMENT + '/tag/new';
export const REMOVE_TAG = SERVER_ADDRESS + DOCUMENT + '/tag/remove';

// Category
export const ALL_GRADE1_CATEGORYS = SERVER_ADDRESS + '/category/get';
export const GET_CATEGORY = SERVER_ADDRESS + '/category';
export const SET_CATEGORY = SERVER_ADDRESS + '/category';

// 로컬 저장소 키값들
export const LOCAL_STORAGE_ACCESS_TOKEN = 'access_token';
export const LOCAL_STORAGE_USER_ID = 'user_id';
