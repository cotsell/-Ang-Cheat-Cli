import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxJs';

import * as Redux from '../../service/redux';
import { Network } from '../../service/Network';
import Account from '../../service/Account';
import * as Utils from '../../service/utils';
import { UserInfo, DocumentInfo } from '../../service/Interface';

// TODO 테스트
import { NewDocumentList, RemoveAllDocumentList } from '../../service/redux/DocumentListReducer';

@Component({
    selector: 'app-document-list',
    templateUrl: './document-list.component.html',
    styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit, OnDestroy {
    private isLoggedIn = false;
    private userInfo: UserInfo;
    private docuList: DocumentInfo[];
    private accountSubscription: Subscription;
    private userInfoSubscription: Subscription;
    private docuListSubscription: Subscription;

    constructor(
        private store: Store<Redux.StoreInfo>,
        private network: Network,
        private account: Account) { }

    ngOnInit() {
        this.subscribeAccountAndTryLogin();
        this.subscribeUserInfo();
        this.subscribeDocumentList();

        // TODO 테스트 후 지워주세요.
        const userInfo = {
            id: 'cotsell@gmail.com',
            nickName: 'cotsell'
        };
        this.store.dispatch(new NewDocumentList(
            { _id: 'testNo1', title: 'TestTitle1', text: 'test', userId: 'cotsell@gmail.com' }));
        this.store.dispatch(new NewDocumentList(
            { _id: 'testNo2', title: 'TestTitle2', text: 'test', userId: 'cotsell@gmail.com' }));
        this.store.dispatch(new NewDocumentList(
            { _id: 'testNo3', title: 'TestTitle3', text: 'test', userId: 'cotsell@gmail.com' }));
        this.store.dispatch(new NewDocumentList(
            { _id: 'testNo4', title: 'TestTitle4', text: 'test', userId: 'cotsell@gmail.com' }));
        this.store.dispatch(new NewDocumentList(
            { _id: 'testNo5', title: 'TestTitle5', text: 'test', userId: 'cotsell@gmail.com' }));
        this.store.dispatch(new NewDocumentList(
            { _id: 'testNo6', title: 'TestTitle6', text: 'test', userId: 'cotsell@gmail.com' }));
    }

    // Account 리덕스를 구독하고, 로그인도 시도해요.
    private subscribeAccountAndTryLogin() {
        this.accountSubscription = this.account.loginWithAccessToken(Result => {
            this.isLoggedIn = Result.loggedIn;
            // this.accessToken = Result.accessToken;
        });
    }

    // UserInfo 리덕스를 구독해요.
    private subscribeUserInfo() {
        this.userInfoSubscription = this.store.select(Redux.getUserInfo)
            .subscribe(Result => {
                this.userInfo = Result;
            });
    }

    // DocumentList 리덕스를 구독해요.
    private subscribeDocumentList() {
        this.docuListSubscription = this.store.select(Redux.getDocumentList)
            .subscribe(Result => {
                this.docuList = Result;
            });
    }

    // 사용자가 pagination을 사용하면 실행되는 함수에요
    private clickedPagination(event) {
        console.log(event);
        // TODO pagination의 상태가 변경되면 해야 할 코드..
    }

    ngOnDestroy() {
        Utils.unSubscribe(this.accountSubscription);
        Utils.unSubscribe(this.userInfoSubscription);
        Utils.unSubscribe(this.docuListSubscription);

        this.store.dispatch(new RemoveAllDocumentList());
    }

}
