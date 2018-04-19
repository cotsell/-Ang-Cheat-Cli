import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxJs';

import { Network } from '../../service/Network';
import * as Redux from '../../service/redux';
import {  } from '../../service/redux/UserInfoReducer';
import Account from '../../service/Account';
import * as Utils from '../../service/utils';
import { UserInfo } from '../../service/Interface';

@Component({
    selector: 'app-profile-detail',
    templateUrl: './profile-detail.component.html',
    styleUrls: ['./profile-detail.component.scss']
})
export class ProfileDetailComponent implements OnInit, OnDestroy {
    private isModalOpen = false; // Modal을 화면에 띄운 상태인지 구분.
    private isLoggedIn = false; // 로그인 되어 있는지 구분.
    private isEditMode = false; // 프로필 내용 수정모드로 변환 구분.
    private isEditable = false; // 프로필 수정하기 버튼을 화면에 표시할지 구분.
    private otherUserId: string; // 타 유저의 닉네임. 타 유저 프로필을 볼 때 사용.
    private userInfo: UserInfo;
    private accountSubscription: Subscription;
    private userInfoSubscription: Subscription;

    // 프로필 폼 설정.
    private profileForm: FormGroup = new FormGroup(
        {
            id: new FormControl(),
            nickName: new FormControl(),
            password: new FormControl(),
            signature: new FormControl()
        }
    );

    constructor(
        private network: Network,
        private store: Store<Redux.StoreInfo>,
        private account: Account,
        private route: ActivatedRoute) {
            this.otherUserId = route.snapshot.params['id'];
        }

    ngOnInit() {
        this.subscribeAccountAndTryLogin();
        if (this.otherUserId !== undefined && this.otherUserId !== null) {
            this.getOtherUserInfo();
            this.isEditable = false;
        } else {
            this.subscribeUserInfo();
            this.isEditable = true;
        }
    }

    private subscribeAccountAndTryLogin() {
        this.accountSubscription = this.account.loginWithAccessToken(
            Result => {
                this.isLoggedIn = Result.loggedIn;
                // this.accessToken = Result.accessToken;
            },
            () => {
                console.log('로그인 실패');
            }
        );
    }

    private subscribeUserInfo() {
        this.userInfoSubscription = this.store.select(Redux.getUserInfo)
            .subscribe(Result => {
                this.userInfo = Result;
            });
    }

    private getOtherUserInfo() {
        this.network.getUserInfo(this.otherUserId)
            .subscribe(result => {
                this.userInfo = result.payload;
            });
    }

    private modalOpen(event) {
        event.stopPropagation();
        this.isModalOpen = true;

        // 프로필 폼 값 초기 설정
        this.profileForm.setValue(
            {
                id: this.userInfo.id,
                nickName: this.userInfo.nickName,
                password: '********',
                signature: this.userInfo.signature
            }
        );
    }

    private cancelModal(event) {
        event.stopPropagation();
        this.isModalOpen = false;
        this.isEditMode = false;
    }

    private okModal(event) {
        event.stopPropagation();
        // TODO 서버에 다시 로그인 과정 거치고..
        // TODO 맞으면 아래.. 아니면 취소 하도록.
        this.isModalOpen = false;
        this.isEditMode = true;
    }

    private cancelEditProfile(event) {
        event.stopPropagation();
        this.isEditMode = false;
    }

    saveProfile(event) {
        event.stopPropagation();
        console.log(JSON.stringify(this.profileForm.value));
    }

    ngOnDestroy() {
        Utils.unSubscribe(this.accountSubscription);
        Utils.unSubscribe(this.userInfoSubscription);
    }

}
