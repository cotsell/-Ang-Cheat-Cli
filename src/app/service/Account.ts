import { Injectable } from '@angular/core';
import { Subscription } from 'rxJs';
import { Store } from '@ngrx/store';

import * as Redux from './redux';
import * as SysConf from './SysConf';
import { Network } from './Network';
import * as UserInfoRedux from './redux/UserInfoReducer';
import * as AccountRedux from './redux/AccountReducer';

@Injectable()
export default class Account {
    constructor(
        private network: Network,
        private store: Store<Redux.StoreInfo>) {}

    // cbFunc(콜백함수)에 인자로 account 리덕스를 구독한 결과값 중 loggedIn을 넣어줍니다.
    // 함수의 결과값으로는 account 리덕스를 구독한 Subscription을 리턴합니다.
    // 구독 기능과는 별개로, 로컬 저장소에 AccessToken과 UserId가 있는지 확인하고,
    // 존재하면 로그인을 시도 합니다.
    // 로그인에 성공하면 account 리덕스의 loggedIn 값을 true로 바꿔주며,
    // 엑세스토큰이 활성화된 값이 아니라면, 로컬 저장소의 AccessToken과 UserId값을 제거합니다.
    // TODO 로그인에 실패했을 경우의 대응은?
    // - 이건 AccessToken을 이용한 로그인이므로, 실패 대응 필요없다.
    loginWithAccessToken(cbFunc): Subscription {
        let subscription: Subscription;

        subscription = this.store.select(Redux.getAccount)
            .subscribe(obs => {
                cbFunc(obs);
                if (obs.loggedIn === undefined || obs.loggedIn === false || obs.loggedIn === null) {
                    login(this.network, this.store);
                }
            });

        function login (network, store) {
            const accessToken = localStorage.getItem(SysConf.LOCAL_STORAGE_ACCESS_TOKEN);
            const userId = localStorage.getItem(SysConf.LOCAL_STORAGE_USER_ID);

            if (accessToken !== undefined && accessToken !== null && accessToken !== '' &&
                userId !== undefined && userId !== null && userId !== '') {
                // 엑세스토큰이 로컬저장소에 존재하면..
                network.checkAccessToken(accessToken, userId)
                    .subscribe(result => {
                        // TODO obs의 응답 내용이 달라질 수 있음.
                        if (result['result'] === true) { // 엑세스토큰이 유효하다면..
                            getUserInfo(network, store, accessToken, userId);
                            changeLoginState(store, accessToken);
                        } else { // 유요한 엑세스토큰이 아니므로, 로컬 저장소 정리.
                            localStorage.removeItem(SysConf.LOCAL_STORAGE_ACCESS_TOKEN);
                            localStorage.removeItem(SysConf.LOCAL_STORAGE_USER_ID);
                        }
                    });
            }
        }

        function getUserInfo(network, store, accessToken: string, userId: string) {
            network.getUserInfo(accessToken, userId)
                .subscribe(resultUserInfo => {
                    // 리덕스에 유저정보 입력.
                    // TODO 유저정보 결과 내용이 달라질 수 있음.
                    store.dispatch(new UserInfoRedux.NewUserInfo(resultUserInfo));
                });
        }

        function changeLoginState(store, accessToken: string) {
            store.dispatch(new AccountRedux.NewAccount(
                {
                    accessToken: accessToken,
                    loggedIn: true
                }
            ));
        }

        return subscription;
    }
}
