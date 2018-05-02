import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxJs';

import { DocumentInfo, UserInfo, Result, Category, Reply } from '../service/Interface';
import * as SysConf from '../service/SysConf';
import * as Redux from './redux';

@Injectable()
export class Network {
    constructor(private http: HttpClient) {}

    signup(id: string, password: string, nickname: string): Observable<Result> {
        return this.http.post<Result>(SysConf.SIGNUP, { id: id, password: password, nickName: nickname });
    }

    // ID와 Password로 로그인
    login(id: string, password: string): Observable<Result> {
        return this.http.post<Result>(SysConf.LOGIN, { id: id, password: password });
    }

    // 이걸 사용해서 accessToken이 유효하면 로그인 한거로 인정
    checkAccessToken(accessToken: string): Observable<Result> {
        return this.http.get<Result>(
            SysConf.CHECK_ACCESS_TOKEN,
            { headers: { 'c-access-token': accessToken } }
        );
    }

    // 사용자 정보 한개를 가져와요.
    getUserInfo(userId: string): Observable<Result> {
        return this.http.post<Result>(SysConf.GET_USER, { id: userId });
    }

    // 사용자 정보 여러개를 가져와요.
    getUserInfos(ids: string[]): Observable<Result> {
        return this.http.post<Result>(SysConf.GET_USERS, { ids });
    }

    // 사용자 프로필 변경 요청.
    updateProfile(accessToken: string, userInfo: UserInfo): Observable<Result> {
        return this.http.post<Result>(
            SysConf.UPDATE_USER,
            userInfo,
            { headers: { 'c-access-token': accessToken } }
        );
    }

    // 비밀번호 변경 요청.
    changePassword(accessToken: string, oldPass: string, newPass: string): Observable<Result> {
        return this.http.post<Result>(SysConf.CHANGE_PASSWORD,
            { oldPass, newPass },
            { headers: { 'c-access-token': accessToken } }
        );
    }

    // 비밀번호 확인 요청.
    checkPassword(accessToken: string, password: string): Observable<Result> {
        return this.http.post<Result>(SysConf.CHECK_PASSWORD,
            { password },
            { headers: { 'c-access-token': accessToken } }
        );
    }

    getUserDocumentList(userId: string): Observable<Result> {
        return this.http.get<Result>(SysConf.GET_USER_DOCUMENT_LIST + '?id=' + userId);
    }

    getDocument(documentId: string): Observable<Result> {
        return this.http.get<Result>(SysConf.GET_DOCUMENT + '/' + documentId);
    }

    modifyDocument(accessToken: string, document: DocumentInfo): Observable<Result> {
        return this.http.post<Result>(
            SysConf.MODIFY_DOCUMENT,
            document,
            { headers: { 'c-access-token': accessToken } }
        );
    }

    removeDocument(accessToken: string, document: DocumentInfo): Observable<Result> {
        // TODO 서버에서 응답할때 DocumentInfo형태로 돌려주지 않을 가능성이 있어요.
        // TODO 테스트 중이라 AccessToken은 보내고 있지 않아요.
        return this.http.post<Result>(
            SysConf.REMOVE_DOCUMENT,
            document,
            { headers: { 'c-access-token': accessToken }}
        );
    }

    newDocument(accessToken: string, document: DocumentInfo): Observable<Result> {
        return this.http.post<Result>(
            SysConf.NEW_DOCUMENT,
            document,
            { headers: { 'c-access-token': accessToken } }
        );
    }

    newTag(accessToken: string, documentId, tag: string): Observable<Result> {
        return this.http.post<Result>(
            SysConf.NEW_TAG,
            { documentId, tag },
            { headers: { 'c-access-token': accessToken } }
        );
    }

    removeTag(accessToken: string, documentId, tag: string): Observable<Result> {
        return this.http.post<Result>(
            SysConf.REMOVE_TAG,
            { documentId, tag },
            { headers: { 'c-access-token': accessToken } }
        );
    }

    // type의 값은 서버의 DB/document.ts의 searchDocument()에서 확인 가능해요.
    searchDocument(lang: string, type: number, subject: string): Observable<Result> {
        const query = `?lang=${lang}&type=${type}&subj=${subject}`;
        return this.http.get<Result>(SysConf.SEARCH_DOCUMENT + query);
    }

    // Grade 1인 모든 카테고리의 grade 1 뎁스만 가지고 와요.
    getAllGradeOneCategorys(): Observable<Result> {
        return this.http.get<Result>(SysConf.ALL_GRADE1_CATEGORYS);
    }

    getAllCategory(): Observable<Result> {
        return this.http.get<Result>(SysConf.ALL_CATEGORY);
    }

    // 해당 ID의 카테고리의 전체 내용을 가져와요.
    getCategory(id: string): Observable<Result> {
        return this.http.get<Result>(SysConf.GET_CATEGORY + '/' + id);
    }

    // 변경하고자 하는 카테고리 전체 내용(하나의 전체 트리)를 인자로 넣어주세요.
    // grade 1의 '_id'값이 포함되어 있는지로, 새로운 카테고리인지, 기존 카테고리인지를 판단해요.
    setCategory(accessToken: string, category: Category): Observable<Result> {
        return this.http.post<Result>(
            SysConf.SET_CATEGORY,
            category,
            { headers: { 'c-access-token': accessToken } }
        );
    }

    removeCategory(accessToken: string, categoryId: string): Observable<Result> {
        return this.http.get<Result>(
            SysConf.REMOVE_CATEGORY + '/' + categoryId,
            { headers: { 'c-access-token': accessToken } }
        );
    }

    // 해당 문서의 리플을 가져옵니다.
    // TODO 일단은 모든 리플을 가져오는데, 페이징을 지원해줘야 할 듯 해요.
    getReply(documentId: string): Observable<Result> {
        return this.http.get<Result>(SysConf.GET_REPLY + '/' + documentId);
    }

    // 새로운 리플을 생성해요.
    makeReply(accessToken: string, reply: Reply): Observable<Result> {
        return this.http.post<Result>(SysConf.MAKE_REPLY,
            reply,
            { headers: { 'c-access-token': accessToken } }
        );
    }

    // 새로운 리리플을 생성해요.
    makeRereply(accessToken: string, reply: Reply): Observable<Result> {
        return this.http.post<Result>(
            SysConf.MAKE_REREPLY,
            reply,
            { headers: { 'c-access-token': accessToken } }
        );
    }

    // 리플 수정.
    updateReply(accessToken: string, reply: Reply): Observable<Result> {
        return this.http.post<Result>(SysConf.UPDATE_REPLY,
            reply,
            { headers: { 'c-access-token': accessToken } }
        );
    }

    // 리리플 수정.
    updateRereply(accessToken: string, reply: Reply): Observable<Result> {
        return this.http.post<Result>(
            SysConf.UPDATE_REREPLY,
            reply,
            { headers: { 'c-access-token': accessToken } }
        );
    }

    // 리플을 삭제 해요.
    removeReply(accessToken: string, replyId: string): Observable<Result> {
        return this.http.get<Result>(SysConf.REMOVE_REPLY + '/' + replyId,
        { headers: { 'c-access-token': accessToken } }
        );
    }

    // 리리플을 삭제 해요.
    removeRereply(accessToken: string, rereply: Reply ): Observable<Result> {
        return this.http.post<Result>(
            SysConf.REMOVE_REREPLY,
            rereply,
            { headers: { 'c-access-token': accessToken }});
    }

}
