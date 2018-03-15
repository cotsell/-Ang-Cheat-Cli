import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxJs';

import { DocumentInfo, UserInfo } from '../service/Interface';
import * as SysConf from '../service/SysConf';
import * as Redux from './redux';

// TODO 이 인터페이스가 실 사용화 되면, Interface.ts로 옮기죠.
interface Respond {
    result: boolean;
    payload: DocumentInfo;
}

@Injectable()
export class Network {
    constructor(private http: HttpClient) {}

    signup(id: string, password: string, nickname: string) {
        // TODO 서버에서 응답내용이 다를 가능성이 있어요.
        return this.http.post(SysConf.SIGNUP, { id: id, password: password, nickname: nickname });
    }

    login(id: string, password: string) {
        // TODO 서버에서 응답내용이 다를 가능성이 있어요.
        return this.http.post(SysConf.LOGIN, { id: id, password: password });
    }

    checkAccessToken(accessToken: string, userId: string) {
        // TODO 서버에서 응답내용이 다를 가능성이 있어요.
        return this.http.post(SysConf.CHECK_ACCESS_TOKEN, { access_token: accessToken, id: userId });
    }

    getUserInfo(userId: string) {
        // TODO 서버에서 응답내용이 다를 가능성이 있어요.
        return this.http.post<UserInfo>(SysConf.GET_USER, { id: userId });
    }

    getDocument(documentId: string): Observable<Respond> {
        // TODO 서버에서 응답할때 DocumentInfo형태로 돌려주지 않을 가능성이 있어요.
        return this.http.get<Respond>(SysConf.GET_DOCUMENT + '/' + documentId);
    }

    modifyDocument(accessToken: string, document: DocumentInfo): Observable<Respond> {
        // TODO 서버에서 응답할때 DocumentInfo형태로 돌려주지 않을 가능성이 있어요.
        // TODO 테스트 중이라 AccessToken은 보내고 있지 않아요.
        return this.http.post<Respond>(SysConf.MODIFY_DOCUMENT, document);
    }

    removeDocument(accessToken: string, document: DocumentInfo): Observable<any> {
        // TODO 서버에서 응답할때 DocumentInfo형태로 돌려주지 않을 가능성이 있어요.
        // TODO 테스트 중이라 AccessToken은 보내고 있지 않아요.
        return this.http.post(SysConf.REMOVE_DOCUMENT, document);
    }

    searchDocument(subject: string) {
        // TODO 서버에서 응답할때 DocumentInfo형태로 돌려주지 않을 가능성이 있어요.
        // TODO 미완성이에요. 서버로 데이터를 전송하는 방식도 달라질 것 같아요.
        return this.http.get(SysConf.SEARCH_DOCUMENT + '/' + subject);
    }

}
