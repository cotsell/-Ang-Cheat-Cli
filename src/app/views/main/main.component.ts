import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';

import Account from '../../service/Account';
import * as Utils from '../../service/utils';
import * as Redux from '../../service/redux';
import { Subscription } from 'rxJs';
import { UserInfo } from '../../service/Interface';
import * as SysConf from '../../service/SysConf';


@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
    private isLoggedIn = false;
    private userInfo: UserInfo;
    private accountSubscription: Subscription;
    private userInfoSubscription: Subscription;

    constructor(
        private account: Account,
        private store: Store<Redux.StoreInfo>) { }

    ngOnInit() {
        this.subscribeAccountAndLogin();
        this.subscribeUserInfo();
    }

    private subscribeAccountAndLogin() {
        console.log(localStorage.getItem(SysConf.LOCAL_STORAGE_ACCESS_TOKEN));

        this.accountSubscription = this.account.loginWithAccessToken(result => {
            this.isLoggedIn = result.loggedIn;
        });
    }

    private subscribeUserInfo() {
        this.userInfoSubscription = this.store.select(Redux.getUserInfo)
            .subscribe(obs => {
                this.userInfo = obs;
            });
    }

    ngOnDestroy() {
        Utils.unSubscribe(this.accountSubscription);
        Utils.unSubscribe(this.userInfoSubscription);
    }

}
