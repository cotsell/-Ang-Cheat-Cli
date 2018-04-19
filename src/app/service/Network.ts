import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxJs';

import { DocumentInfo, UserInfo, Result, Category } from '../service/Interface';
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

    getUserInfo(userId: string): Observable<Result> {
        // TODO AccessToken이 필요해야 하려나??
        return this.http.post<Result>(SysConf.GET_USER, { id: userId });
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

    searchDocument(subject: string): Observable<Result> {
        // TODO 서버에서 응답할때 DocumentInfo형태로 돌려주지 않을 가능성이 있어요.
        // TODO 미완성이에요. 서버로 데이터를 전송하는 방식도 달라질 것 같아요.
        return this.http.get<Result>(SysConf.SEARCH_DOCUMENT + '/' + subject);
    }

    // Grade 1인 모든 카테고리의 grade 1 뎁스만 가지고 와요.
    getAllGrade1Categorys(): Observable<Result> {
        return this.http.get<Result>(SysConf.ALL_GRADE1_CATEGORYS);
    }

    // 해당 ID의 카테고리의 전체 내용을 가져와요.
    getCategory(id: string): Observable<Result> {
        return this.http.get<Result>(SysConf.GET_CATEGORY + '/' + id + '/get');
    }

    // 변경하고자 하는 카테고리 전체 내용(하나의 전체 트리)를 인자로 넣어주세요.
    // grade 1의 '_id'값이 포함되어 있는지로, 새로운 카테고리인지, 기존 카테고리인지를 판단해요.
    setCategory(category: Category): Observable<Result> {
        // TODO access token needs to be inserted.
        return this.http.post<Result>(SysConf.SET_CATEGORY, category);
    }

}
