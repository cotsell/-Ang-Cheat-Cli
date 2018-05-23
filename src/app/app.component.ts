import { Component, OnInit, OnDestroy } from '@angular/core';
import { Account } from './service/Account';
import { Subscription } from 'rxJs';

import { unSubscribe } from './service/utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';
  loggedIn: false;
  accessToken: undefined;
  accountSubsc: Subscription;
  
  constructor(private account: Account) {
    this.subscribeAccountAndLogin();
  }

  ngOnInit() {

  }

  subscribeAccountAndLogin() {
    this.accountSubsc = this.account.loginWithAccessToken(result => {
      // this.loggedIn = result.loggedIn;
      // this.accessToken = result.accessToken;
      // console.log(result.loggedIn);
      // console.log(result.accessToken);
    });
  }

  ngOnDestroy() {
    unSubscribe(this.accountSubsc);
  }
}
