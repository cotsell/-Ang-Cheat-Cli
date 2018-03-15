import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxJs';

import * as Redux from '../../service/redux';
import { ModifyAccount, NewAccount } from '../../service/redux/AccountReducer';
import { NewUserInfo, RemoveUserInfo } from '../../service/redux/UserInfoReducer';
import * as Utils from '../../service/utils';
import * as SysConf from '../../service/SysConf';
import { UserInfo, userInfo } from '../../service/Interface';
import { Network } from '../../service/Network';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    private isLoggedIn = false;
    private signupMode = false;
    private userInfo: UserInfo;

    private accountSubscription: Subscription;
    private userInfoSubscription: Subscription;

    // 로그인 관련 폼 설정
    loginForm: FormGroup = new FormGroup({
        id: new FormControl(),
        password: new FormControl()
    });

    // 가입 관련 폼 설정.
    signupForm: FormGroup = new FormGroup({
        id: new FormControl(),
        password: new FormControl(),
        confirm: new FormControl(),
        nickName: new FormControl()
    });

    constructor(
        private store: Store<Redux.StoreInfo>,
        private network: Network) { }

    ngOnInit() {
        this.subscribeAccount();
        this.subscribeUserInfo();
    }

    // Account 리덕스를 구독해요.
    private subscribeAccount() {
        this.accountSubscription = this.store.select(Redux.getAccount)
            .subscribe(obs => {
                this.isLoggedIn = obs.loggedIn;
            });
    }

    // UserInfo 리덕스를 구독해요.
    private subscribeUserInfo() {
        this.userInfoSubscription = this.store.select(Redux.getUserInfo)
            .subscribe(obs => {
                this.userInfo = obs;
            });
    }

    private login(event) {
        event.stopPropagation();
        this.network.login(this.loginForm.value['id'], this.loginForm.value['password'])
            .subscribe(loginResult => {
                const result = loginResult['result'];
                const access_token = loginResult['access_token'];
                const userId = loginResult['userId'];

                if (result === true) { // 로그인 성공 시..
                    localStorage.setItem(SysConf.LOCAL_STORAGE_ACCESS_TOKEN, access_token);
                    localStorage.setItem(SysConf.LOCAL_STORAGE_USER_ID, userId);
                    this.store.dispatch(new NewAccount(
                        {
                            accessToken: access_token,
                            loggedIn: true
                        }));

                    // TODO 아마도 로그인 하면 유저정보도 같이 받게 될 가능성이 큼. 삭제하게 될 듯.
                    this.network.getUserInfo(userId)
                        .subscribe(userInfoResult => {
                            this.store.dispatch(new NewUserInfo(userInfoResult));
                        });
                } else {
                    // TODO ID, PASSWORD 로그인 실패시 대응 코딩.
                    console.log('로그인 실패: ' + JSON.stringify(loginResult));
                }
            });
    }

    // 로그아웃 버튼을 누르면, 로컬 저장소의 계정 정보를 모두 삭제하고,
    // 리덕스의 로그인 관련 정보를 모두 삭제해요.
    private logout(event) {
        event.stopPropagation();
        localStorage.removeItem(SysConf.LOCAL_STORAGE_ACCESS_TOKEN);
        localStorage.removeItem(SysConf.LOCAL_STORAGE_USER_ID);
        this.store.dispatch(new ModifyAccount({ accessToken: undefined, loggedIn: false }));
        this.store.dispatch(new RemoveUserInfo());
    }

    private show_signup(event) {
        event.stopPropagation();
        this.signupMode = !this.signupMode;
    }

    private signup(event) {
        event.stopPropagation();
        const { id, password, nickName } = this.signupForm.value;
        this.network.signup(id, password, nickName)
            .subscribe(Result => {
                if (Result['result'] === true) { // 가입 성공하면, 로그인 시도.
                    const result = Result['result'];
                    const access_token = Result['access_token'];
                    const userId = Result['userId'];

                    localStorage.setItem(SysConf.LOCAL_STORAGE_ACCESS_TOKEN, access_token);
                    localStorage.setItem(SysConf.LOCAL_STORAGE_USER_ID, userId);

                    this.store.dispatch(new NewAccount(
                        {
                            accessToken: access_token,
                            loggedIn: true
                        }));

                    // TODO 아마도 로그인 하면 유저정보도 같이 받게 될 가능성이 큼. 삭제하게 될 듯.
                    this.network.getUserInfo(userId)
                        .subscribe(userInfoResult => {
                            this.store.dispatch(new NewUserInfo(userInfoResult));
                        });
                } else {
                    // TODO 가입 실패 하면, 어떻게 할지 코딩 필요.
                    // TODO 가입 실패 사유를 표기한다거나..
                    console.log('가입 실패: ' + Result['msg']);
                    this.signupForm.setValue(
                        {
                            id: this.signupForm.value['id'],
                            password: '',
                            confirm: '',
                            nickName: this.signupForm.value['nickName']
                        }
                    );
                }
            });
    }

    ngOnDestroy() {
        Utils.unSubscribe(this.accountSubscription);
        Utils.unSubscribe(this.userInfoSubscription);
    }
}
