import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';

import { Account } from '../../service/Account';
import { unSubscribe } from '../../service/utils';
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
  isLoggedIn = false;
  userInfo: UserInfo = undefined;
  accountSubsc: Subscription;
  userInfoSubsc: Subscription;

  constructor(
    private account: Account,
    private store: Store<Redux.StoreInfo>) { }

  ngOnInit() {
    this.subscribeAccountAndLogin();
    this.subscribeUserInfo();
  }

  subscribeAccountAndLogin() {
    // console.log(localStorage.getItem(SysConf.LOCAL_STORAGE_ACCESS_TOKEN));

    this.accountSubsc = this.account.loginWithAccessToken(result => {
      this.isLoggedIn = result.loggedIn;
    });
  }

  subscribeUserInfo() {
    this.userInfoSubsc = this.store.select(Redux.getUserInfo)
    .subscribe(obs => {
      this.userInfo = obs;
    });
  }

  ngOnDestroy() {
    unSubscribe(this.accountSubsc);
    unSubscribe(this.userInfoSubsc);
  }

}
