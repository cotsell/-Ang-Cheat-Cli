export class Account {
    accessToken?: string;
    loggedIn?: boolean;
}

export class UserInfo {
    id?: string;
    password?: string;
    grade?: number;
    nickName?: string;
    profileImgUrl?: string;
    // myDocumentIdList?: string[];
    myScrapIdList?: string[];
    totalThumbUp?: number;
    signature?: string;
    createdTime?: Date;
    updatedTime?: Date;

    constructor() {}

}

export interface DocumentInfoForRedux extends DocumentInfo {
    userInfo?: UserInfo;
}

export interface DocumentInfo {
    _id?: string;
    title?: string;
    text?: string;
    createdTime?: Date;
    modifiedTime?: Date;
    relatedDocuId?: string;
    thumbUp?: string[];
    userId?: string;
    tagList?: string[];
    libraryList?: Library[];
}

export interface Library {
    _id?: string;
    title?: string;
    version?: string;
    memo?: string;
}

export class Tag {
    _id?: string;
    title?: string;
    constructor(TagName?: string) {
        if (TagName !== undefined) {
            this.title = TagName;
        }
    }
}

// ---- 카테고리 인터페이스 ----
interface CategoryGrade3 {
    _id?: string;
    title?: string;
    tag?: string;
    grade?: number;
}

interface CategoryGrade2 extends CategoryGrade3 {
    subCategory?: CategoryGrade3[];
}

export interface Category extends CategoryGrade2 {
    createdTime?: Date;
    deleted?: boolean;
    historyId?: string;
    subCategory?: CategoryGrade2[];
}
// ---- 카테고리 인터페이스 ----

export interface Result {
    result: boolean;
    msg?: string;
    code?: number;
    payload?: any;
}


// 더미 데이터
export const account = new Account();
account.accessToken = 'abcabcabcd';

export const userInfo = new UserInfo();
userInfo.id = 'cotsell@gmail.com';
userInfo.nickName = 'cotsell';
userInfo.profileImgUrl = 'http://localhost:8000/cotsell/profile/img';
userInfo.grade = 0;
userInfo.totalThumbUp = 320;
userInfo.myScrapIdList = [];
// userInfo.myDocumentIdList = ['test1', 'test2', 'test3'];
userInfo.signature = '이 사이트 개발자. 짱짱맨.';

export const docuInfo: DocumentInfo = {
    _id: 'test2',
    title: '테스트 문서에요',
    text: '본문 내용은 일단은 패스.',
    createdTime: new Date(),
    modifiedTime: new Date(),
    relatedDocuId: 'related1',
    thumbUp: ['12.34.55', '21.43.56', '55.66.77'],
    userId: 'cotsell@gmail.com',
    tagList: ['TestTag1', 'TestTag2'],
    libraryList: [],
};
// 더미 데이터 끝
