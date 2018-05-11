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
    myDocumentIdList?: string[];
    totalThumbUp?: number;
    signature?: string;
    createdTime?: Date;
    updatedTime?: Date;
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
    userInfo?: UserInfo;
    tagList?: string[];
    libraryList?: Library[];
    historyId?: string;
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

export interface Scrap {
    labelList: string[];
    docuList: { docuId: string, docuTitle: string, label: string, createdTime: Date }[];
}

// ---- 카테고리 인터페이스 ----
export interface CategoryGrade3 {
    _id?: string;
    title?: string;
    tag?: string;
    grade?: number;
    createdTime?: Date;
}

export interface CategoryGrade2 extends CategoryGrade3 {
    subCategory?: CategoryGrade3[];
}

export interface Category extends CategoryGrade2 {
    deleted?: boolean;
    deletedBy?: string;
    updatedBy?: string;
    historyId?: string;
    subCategory?: CategoryGrade2[];
}
// ---- 카테고리 인터페이스 ----

export interface Reply {
    _id?: string;
    historyId?: string;
    parentId: string;
    text: string;
    userId: string;
    createdTime?: Date;
    updatedTime?: Date;
    deleted?: boolean;
    updated?: boolean;
    deletedReply?: boolean;
    rereply?: Reply[];
}

export interface Result {
    result: boolean;
    msg?: string;
    code?: number;
    payload?: any;
}
