export class Account {
    accessToken: string;
    loggedIn: boolean;
}

export class UserInfo {
    id: string;
    password?: string;
    nickName?: string;
    profileImgUrl?: string;
    myDocumentIdList?: string[];
    myScrapList?: string[];
    totalThumbUp?: number;
    grade?: number;
    signature?: string;

    constructor() {}

}

export class DocumentInfo {
    id: string;
    title: string;
    text?: string;
    createdTime?: Date;
    modifiedTime?: Date;
    relatedDocuId?: string;
    thumbUp?: string[];
    userInfo?: UserInfo;
    tagList?: Tag[];
    libraryList?: Library[];

    constructor() {}
}

export class Library {

    constructor() {}
}

export class Tag {
    id: string;
    title: string;
    constructor(TagName?: string) {
        if (TagName !== undefined) {
            this.title = TagName;
        }
    }
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
userInfo.myScrapList = [];
userInfo.myDocumentIdList = ['test1', 'test2', 'test3'];
userInfo.signature = '이 사이트 개발자. 짱짱맨.';

export const docuInfo = new DocumentInfo();
docuInfo.id = 'test2';
docuInfo.title = '테스트 문서에요';
docuInfo.text = '본문 내용은 일단은 패스.';
docuInfo.createdTime = new Date();
docuInfo.modifiedTime = new Date();
docuInfo.relatedDocuId = 'related1';
docuInfo.thumbUp = ['12.34.55', '21.43.56', '55.66.77'];
docuInfo.userInfo = userInfo;
docuInfo.tagList = [new Tag('TestTag1'), new Tag('TestTag2')];
docuInfo.libraryList = [];
// 더미 데이터 끝
