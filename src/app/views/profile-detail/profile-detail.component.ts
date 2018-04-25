/*
    isModalOpen: 패스워드 확인 모달을 화면에 띄운 상태인지?
    isPasswordModalOpen: 패스워드 변경 모달을 화면에 띄운 사태인지?
    isLoggedId: 로그인 된 상태인지?
    accessToken: 리덕스로부터 가져온 accessToken
    isEditMode: 수정될지도 모름. 프로필의 내용을 수정모드로 변환 구분 상태.
    idEditable
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxJs';

import { Network } from '../../service/Network';
import * as Redux from '../../service/redux';
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
    private isPasswordModalOpen = false; // 비밀번호 변경 버튼 누를시 출력되는 모달 구분.
    private isLoggedIn = false; // 로그인 되어 있는지 구분.
    private accessToken: string;
    private isEditMode = false; // 프로필 내용 수정모드로 변환 구분.
    private isEditable = false; // 프로필 수정하기 버튼을 화면에 표시할지 구분.
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

    // 비밀번호 변경 폼.
    private changePassForm: FormGroup = new FormGroup(
        {
            oldPass: new FormControl(),
            newPass: new FormControl()
        }
    );

    // 비밀번호 확인 폼.
    private checkPassForm: FormGroup = new FormGroup(
        {
            password: new FormControl()
        }
    );

    constructor(
        private network: Network,
        private store: Store<Redux.StoreInfo>,
        private account: Account,
        private router: Router,
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
                this.accessToken = Result.accessToken;
            },
            () => {
                // TODO 로그인 실패시 유저에게 뭘 해줘야 할지.
                console.log('로그인 실패');

                // 다른 유저 정보 보기는 로그인 안해도 가능.
                // 다른 유저 정보 보기모드가 아닌 경우에는 로그아웃 상태면 메인화면으로 백.
                const userId = this.route.snapshot.params['id'];
                if (isMyProfileMode()) {
                    console.log(`내 프로필 모드에서 로그인 되어있지 않으므로 메인화면으로 이동할께요.`);
                    this.router.navigate(['/']);
                } else {
                    // 다른 유저 정보 보기 모드에서는 아무것도 하지 말자..
                }

                // ---- 정리용도 함수들 ----
                function isMyProfileMode() {
                    return (userId === undefined || userId === null || userId === '');
                }
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

    // -----------------------------
    // ---- 프로필 수정 화면 관련
    // -----------------------------

    saveProfile(event) {
        event.stopPropagation();
        console.log(JSON.stringify(this.profileForm.value));
    }

    private cancelEditProfile(event) {
        event.stopPropagation();
        this.isEditMode = false;
    }

    // -------------------------------
    // ---- 패스워드 확인 모달 관련
    // -------------------------------

    // 비밀번호 확인 모달을 열어주는 함수.
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

    // 비밀번호 확인 모달을 취소하는 버튼.
    private cancelModal(event) {
        event.stopPropagation();
        this.isModalOpen = false;
        this.isEditMode = false;
    }

    // 유저가 입력한 확인용 비밀번호를 서버로 전송하는 버튼.
    private okModal(event) {
        event.stopPropagation();

        this.network.checkPassword(this.accessToken, this.checkPassForm.value['password'])
            .subscribe(value => {
                if (value.result === true) {
                    // TODO 비밀번호 확인 완료.
                    console.log(value.msg);
                    this.resetCheckPassFormData();
                    this.isModalOpen = false;
                    this.isEditMode = true;
                } else {
                    // TODO 비밀번호가 틀림.
                    console.log(value.msg);
                    alert(value.msg);
                    this.resetCheckPassFormData();
                }
            });
    }

    private resetCheckPassFormData() {
        this.checkPassForm.setValue({ password: '' });
    }

    // ---------------------------
    // ---- 패스워드 모달 관련
    // ---------------------------

    // 패스워드 변경 모달에서 Submit을 누르면 실행되는 함수.
    private changePassword($event) {
        event.stopPropagation();
        // TODO 패스워드 변경.
        this.network.changePassword(
            this.accessToken,
            this.changePassForm.value['oldPass'],
            this.changePassForm.value['newPass']
        )
        .subscribe(value => {
            console.log(value.msg);
            if (value.result === true) {
                // TODO 비밀번호 변경 성공했는데.. 뭐 모달 같은거라도 띄워줄까?
                alert(value.msg);
                this.resetPasswordFormData();
                this.isPasswordModalOpen = false;
            } else {
                // TODO 비밀번호 변경 실패시
                alert(value.msg);
            }
        });
    }

    // 패스워드 변경 모달에서 reset을 누르면 실행되는 함수.
    private passModalCancelButton(event) {
        event.stopPropagation();
        this.resetPasswordFormData();
        this.isPasswordModalOpen = false;
    }

    // 패스워드 폼의 데이터를 모두 리셋해요.
    private resetPasswordFormData() {
        this.changePassForm.setValue({
            oldPass: '',
            newPass: ''
        });
    }

    // ---------------------
    // ---- 기타 범용 함수
    // ---------------------
    private stopBubbling(event) {
        event.stopPropagation();
    }

    ngOnDestroy() {
        Utils.unSubscribe(this.accountSubscription);
        Utils.unSubscribe(this.userInfoSubscription);
    }

}
