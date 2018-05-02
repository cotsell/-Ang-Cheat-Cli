export const SERVER_ADDRESS = 'http://localhost:8010';

// Account
export const SIGNUP = SERVER_ADDRESS + '/account/signup';
export const LOGIN = SERVER_ADDRESS + '/account/login';
export const CHECK_ACCESS_TOKEN = SERVER_ADDRESS + '/account/check';

// Account
export const NEW_USER = SERVER_ADDRESS + '/account/user/new';
export const GET_USER = SERVER_ADDRESS + '/account/user';
export const GET_USERS = SERVER_ADDRESS + '/account/users';
export const UPDATE_USER = SERVER_ADDRESS + '/account/user/update';
export const REMOVE_USER = SERVER_ADDRESS + '/account/user/remove';
export const CHANGE_PASSWORD = SERVER_ADDRESS + '/account/user/changePassword';
export const CHECK_PASSWORD = SERVER_ADDRESS + '/account/user/checkPassword';

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
export const ALL_CATEGORY = SERVER_ADDRESS + '/category/all';
export const GET_CATEGORY = SERVER_ADDRESS + '/category/get';
export const SET_CATEGORY = SERVER_ADDRESS + '/category';
export const REMOVE_CATEGORY = SERVER_ADDRESS + '/category/remove';
export const VALUE_ALL_CATEGORY = 'category-all';

// Reply
export const GET_REPLY = SERVER_ADDRESS + '/reply/get';
export const MAKE_REPLY = SERVER_ADDRESS + '/reply';
export const UPDATE_REPLY = SERVER_ADDRESS + '/reply/update';
export const REMOVE_REPLY = SERVER_ADDRESS + '/reply/remove';
export const MAKE_REREPLY = SERVER_ADDRESS + '/reply/rereply';
export const UPDATE_REREPLY = SERVER_ADDRESS + '/reply/rereply/update';
export const REMOVE_REREPLY = SERVER_ADDRESS + '/reply/rereply/remove';

// 로컬 저장소 키값들
export const LOCAL_STORAGE_ACCESS_TOKEN = 'access_token';
export const LOCAL_STORAGE_USER_ID = 'user_id';

// 출력 메세지들.
export const MSG_PROFILE_DETAIL_UPDATE_ERROR = '업데이트 실패했어요.';
export const MSG_PROFILE_DETAIL_PASS_ERROR = '비밀번호가 틀려요.';
export const MSG_PROFILE_DETAIL_PASS_ERROR2 = '비밀번호 변경에 실패했어요..';
export const MSG_PROFILE_DETAIL_PASS_OK = '비밀번호 변경 완료했어요.';

export const MSG_DOCUMENT_DETAIL_ACCESS_TOKEN_ERROR = '엑세스토큰 문제 발생';
export const MSG_CATEGORY_MAKER_SAVE_OK = '카테고리 변경 완료.';
export const MSG_CATEGORY_MAKER_EMPTY_VALUE_ERR = '카테고리 이름이나 태그를 입력 해 주세요.';
export const MSG_CATEGORY_MAKER_NOT_SELECT = '카테고리를 선택 해 주세요.';
export const MSG_REPLY_MAKE_REPLY_ERR = '리플 작성에 실패 했어요.';
export const MSG_REPLY_GET_ALL_ERR = '리플 가져오기에 실패 했어요.';
export const MSG_REREPLY_MAKE_REREPLY_ERR = '리리플 작성에 실패 했어요.';
export const MSG_REREPLY_REMOVE_REREPLY_ERR = '리리플 삭제에 실패 했어요.';
