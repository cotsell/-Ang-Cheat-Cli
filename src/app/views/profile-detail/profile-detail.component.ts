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
    private isPasswordModalOpen = false; // 비밀번호 변경 버튼 누를시 출력되는 모달 구분.
    private userInfo: UserInfo;
    private accountSubscription: Subscription;
    private userInfoSubscription: Subscription;

    // 프로필 폼 설정.
    private profileForm: FormGroup = new FormGroup(
        {
            nickName: new FormControl(),
            signature: new FormControl()
        }
    );

    private changePassForm: FormGroup = new FormGroup(
        {
            oldPass: new FormControl(),
            newPass: new FormControl()
        }
    );

    constructor(
        private network: Network,
        private store: Store<Redux.StoreInfo>,
        private account: Account,
        private route: ActivatedRoute) {  }

    ngOnInit() {
        this.subscribeAccountAndTryLogin();
        this.subscribeSelectedUserInfo();
    }

    // 컴포넌트가 로그인 유저 정보를 보여줄지, 다른 유저의 정보를 보여줄지 결정.
    private subscribeSelectedUserInfo() {
        const userId = this.route.snapshot.params['id'];
        if (userId !== undefined && userId !== null) {
            this.getOtherUserInfo(userId);
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

    // 리덕스에서 사용자 정보를 구독하고, 유저가 작성한 문서 리스트도 가져옵니다.
    private subscribeUserInfo() {
        this.userInfoSubscription = this.store.select(Redux.getUserInfo)
        .subscribe(Result => {
            this.userInfo = Result;
            this.getUserDocumentList();
        });
    }

    // 서버에 다른 유저 정보를 요청하고, 해당 유저가 작성한 문서 리스트도 가져와요.
    // 리덕스에 정보를 넣지는 않고, 바로 변수로 넣어요.
    private getOtherUserInfo(otherUserId: string) {
        this.network.getUserInfo(otherUserId)
        .subscribe(result => {
            this.userInfo = result.payload;
            this.getUserDocumentList();
        });
    }

    // this.userInfo에 저장된 유저의 작성한 문서 리스트를 가져와요.
    // this.userInfo는 로그인 한 유저일 수도, 다른 유저일 수도 있어요.
    private getUserDocumentList() {
        if (this.userInfo !== undefined && this.userInfo !== null) {
            this.network.getUserDocumentList(this.userInfo.id)
            .subscribe(value => {
                if (value.result === true) {
                    this.userInfo.myDocumentIdList = value.payload;
                } else {
                    // 현재 서버에서는 true만 보내요. 없으면 []를 payload로 리턴.
                }
            });
        }
    }

    private modalOpen(event) {
        event.stopPropagation();
        this.isModalOpen = true;

        // 프로필 폼 값 초기 설정
        this.profileForm.setValue(
            {
                nickName: this.userInfo.nickName,
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

    private changePassword($event) {
        event.stopPropagation();
        // TODO 패스워드 변경.
    }

    private passModalCancelButton(event) {
        event.stopPropagation();
        this.isPasswordModalOpen = false;
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
