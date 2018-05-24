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
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxJs';

import { Network } from '../../service/Network';
import * as Redux from '../../service/redux';
import * as Utils from '../../service/utils';
import { UserInfo, Result, Scrap, Account as iAccount } from '../../service/Interface';
import { ModifyUserInfo } from '../../service/redux/UserInfoReducer';
import * as conf from '../../service/SysConf';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss']
})
export class ProfileDetailComponent implements OnInit, OnDestroy {
  isModalOpen = false; // Modal을 화면에 띄운 상태인지 구분.
  isPasswordModalOpen = false; // 비밀번호 변경 버튼 누를시 출력되는 모달 구분.
  isScrapListModalOpen = false; // 스크랩 리스트 모달 오픈 여부
  isUserImgModalOpen = false; // 유저 이미지 변경 모달 오픈 여부
  // isLoggedIn = false; // 로그인 되어 있는지 구분.
  // accessToken: string;
  accountInfo: iAccount = 
    { loggedIn: false, accessToken: undefined, reduxState: 'none' };
  isEditMode = false; // 프로필 내용 수정모드로 변환 구분.
  isEditable = false; // 프로필 수정하기 버튼을 화면에 표시할지 구분.
  loginUserInfo: UserInfo = undefined;
  userInfo: UserInfo = undefined;
  userDocumentsCount = 0;
  readonly SERVER_ADDRESS = conf.SERVER_ADDRESS;

  userScrapList: Scrap = undefined;

  accountSubsc: Subscription;
  loginUserInfoSubsc: Subscription;
  userInfoSubsc: Subscription;

  // 프로필 폼 설정.
  profileForm: FormGroup = new FormGroup(
    {
      nickName: new FormControl('', Validators.required),
      signature: new FormControl('')
    }
  );

  // 비밀번호 변경 폼.
  changePassForm: FormGroup = new FormGroup(
    {
      oldPass: new FormControl('',
        [Validators.required, Validators.minLength(8)]),
      newPass: new FormControl('',
        [Validators.required, Validators.minLength(8)])
    }
  );

  // 비밀번호 확인 폼.
  checkPassForm: FormGroup = new FormGroup(
    { password: new FormControl("", Validators.required) }
  );

  constructor(
    private network: Network,
    private store: Store<Redux.StoreInfo>,
    private router: Router,
    private route: ActivatedRoute) {  }

  ngOnInit() {
    this.subscribeAccount();
  }

  subscribeAccount() {

    this.accountSubsc = this.store.select(Redux.getAccount)
    .subscribe(result => {
      if (result.reduxState === 'done') {
        if (result.loggedIn) {
          this.accountInfo = result;
        } else {
          // console.error(`내 프로필 모드에서 로그인 되어있지 않으므로 메인화면으로 이동할께요.`);
          // this.router.navigate(['/']);
        }
  
        this.subscribeUserInfo();
      }
    });
  }

  // 리덕스에서 사용자 정보를 구독하고, 유저가 작성한 문서 리스트도 가져옵니다.
  subscribeUserInfo() {
    console.log(`!!!!`);
    console.log(this.accountInfo);

    this.loginUserInfoSubsc = this.store.select(Redux.getUserInfo)
    .subscribe(result => {

      const userId = this.route.snapshot.params['id'];

      if (this.accountInfo.loggedIn && result.reduxState === 'done') { 
        
        if (result.id !== undefined &&
            (userId === undefined || userId === result.id) ) {
          this.loginUserInfo = result;
          this.userInfo = result;
          this.getUserDocumentsCount();
          this.getScrap();
          this.chooseEditable();
        } else if ( result.id !== undefined && 
                    userId !== undefined && userId !== result.id){
          this.getOtherUserInfo(userId);
        }

      } else if (this.accountInfo.loggedIn === false){
        if (userId === undefined ) {
          console.error(`내 프로필 모드에서 로그인 되어있지 않으므로 메인화면으로 이동할께요.`);
          this.router.navigate(['/']);
        } else {
          this.getOtherUserInfo(userId);
        }
      } 

      // Delete Me after Testing 05-24
      // if (result.reduxState === 'done') {

      //   if (result.id !== undefined) {
      //     this.loginUserInfo = result;
      //   }
  
      //   const userId = this.route.snapshot.params['id'];
  
      //   if (this.loginUserInfo) {
      //     if (userId === undefined || userId === this.loginUserInfo.id) {
      //       this.userInfo = this.loginUserInfo;
      //       this.getUserDocumentsCount();
      //       this.getScrap();
      //       this.chooseEditable();
      //     } else {
      //       this.getOtherUserInfo(userId);
      //     }
      //   } else {
      //     if (userId === undefined ) {
      //       // console.error(`내 프로필 모드에서 로그인 되어있지 않으므로 메인화면으로 이동할께요.`);
      //       // this.router.navigate(['/']);
      //     } else {
      //       this.getOtherUserInfo(userId);
      //     }
      //   }
      // }

    });
  }

  // 서버에 다른 유저 정보를 요청하고, 해당 유저가 작성한 문서 리스트도 가져와요.
  // 리덕스에 정보를 넣지는 않고, 바로 변수로 넣어요.
  getOtherUserInfo(otherUserId: string) {
    this.network.getUserInfo(otherUserId)
    .subscribe(result => {
      this.userInfo = result.payload;
      this.getUserDocumentsCount();
    });
  }

  // isEditable를 활성화 시킬 것인지 결정.
  chooseEditable() {
    const userId = this.route.snapshot.params['id'];

    if (this.loginUserInfo !== undefined &&
        this.userInfo.id !== undefined &&
        this.userInfo.id === this.loginUserInfo.id) {
      this.isEditable = true;
    } else {
      this.isEditable = false;
    }
  }

  // this.userInfo에 저장된 유저의 작성한 문서 리스트를 가져와요.
  // this.userInfo는 로그인 한 유저일 수도, 다른 유저일 수도 있어요.
  getUserDocumentsCount() {
    if (this.userInfo !== undefined && this.userInfo !== null) {
      this.network.getUserDocumentsCount(this.userInfo.id)
        .subscribe(value => {
          if (value.result === true) {
            this.userDocumentsCount = value.payload;
          } else {
            // 현재 서버에서는 true만 보내요. 없으면 []를 payload로 리턴.
          }
        });
    }
  }

  // 서버로부터 유저의 스크랩 리스트를 가져와요.
  getScrap() {
    this.network.getScrap(this.accountInfo.accessToken)
    .subscribe(result => {
      if (result.result === true) {
        console.log(result.msg);
        this.userScrapList = result.payload;
        // console.log(this.userScrapList);
      } else {
        console.error(result.msg);
        this.userScrapList = undefined;
      }
    });
  }

  // -----------------------------------------------------------
  // ---- 프로필 수정 화면 관련
  // -----------------------------------------------------------

  saveProfile(event) {
    if (event) { event.stopPropagation(); }

    if (this.profileForm.valid) {
      const userInfo: UserInfo = {
        nickName:  this.profileForm.value['nickName'],
        signature: this.profileForm.value['signature']
      };

      this.network.updateProfile(this.accountInfo.accessToken, userInfo)
      .subscribe(value => {
        if (value.result === true) {
          console.log(`업데이트 성공:\n` + value.msg);
          this.store.dispatch(new ModifyUserInfo(userInfo));
          this.isEditMode = false;
        } else {
          // TODO update실패시 대응..
          alert(conf.MSG_PROFILE_DETAIL_UPDATE_ERROR);
        }
      });
    } else {
      alert('닉네임을 입력 해주세요.');
    }
  }

  cancelEditProfile(event) {
    if (event) { event.stopPropagation(); }

    this.isEditMode = false;
  }

  // -------------------------------
  // ---- 패스워드 확인 모달 관련
  // -------------------------------

  // 비밀번호 확인 모달을 열어주는 함수.
  modalOpen(event) {
    if (event) { event.stopPropagation(); }

    this.isModalOpen = true;

    // 프로필 폼 값 초기 설정
    this.profileForm.setValue(
      {
        nickName: this.userInfo.nickName,
        signature: this.userInfo.signature
      }
    );

    Utils.bodyScroll(false);
  }

  // 비밀번호 확인 모달을 취소하는 버튼.
  cancelModal(event) {
    if (event) { event.stopPropagation(); }

    this.isModalOpen = false;
    this.isEditMode = false;
    Utils.bodyScroll(true);
  }

  // 유저가 입력한 확인용 비밀번호를 서버로 전송하는 버튼.
  okModal(event) {
    if (event) { event.stopPropagation(); }

    if (this.checkPassForm.valid) {
      this.network.checkPassword(
        this.accountInfo.accessToken, this.checkPassForm.value['password'])
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
            alert(conf.MSG_PROFILE_DETAIL_PASS_ERROR);
            this.resetCheckPassFormData();
          }
        });
    } else {
      alert('패스워드를 입력해 주세요.');
    }

    Utils.bodyScroll(true);
  }

  resetCheckPassFormData() {
    this.checkPassForm.setValue({ password: '' });
  }

  // -----------------------------------------------------------
  // ---- 패스워드 변경 모달 관련
  // -----------------------------------------------------------

  passModalOpen(event) {
    if (event) { event.stopPropagation(); }

    this.isPasswordModalOpen = true;
    Utils.bodyScroll(false);
  }

  // 패스워드 변경 모달에서 Submit을 누르면 실행되는 함수.
  changePassword(event) {
    if (event) { event.stopPropagation(); }

    // 유효성 검사.
    if (this.changePassForm.valid) {
      this.network.changePassword(
        this.accountInfo.accessToken,
        this.changePassForm.value['oldPass'],
        this.changePassForm.value['newPass'])
      .subscribe(value => {
        console.log(value.msg);

        if (value.result === true) {
          // TODO 비밀번호 변경 성공했는데.. 뭐 모달 같은거라도 띄워줄까?
          alert(conf.MSG_PROFILE_DETAIL_PASS_OK);
          this.resetPasswordFormData();
          this.isPasswordModalOpen = false;
          Utils.bodyScroll(true);
        } else {
          // TODO 비밀번호 변경 실패시
          alert(conf.MSG_PROFILE_DETAIL_PASS_ERROR2);
        }
      });
    } else {
      alert('기존 비밀번호와, 새 비밀번호를\n 모두 입력 해 주세요.');
    }
  }

  // 패스워드 변경 모달에서 reset을 누르면 실행되는 함수.
  passModalCancelButton(event) {
    if (event) { event.stopPropagation(); }

    this.resetPasswordFormData();
    this.isPasswordModalOpen = false;
    Utils.bodyScroll(true);
  }

  // 패스워드 폼의 데이터를 모두 리셋해요.
  resetPasswordFormData() {
    this.changePassForm.setValue({
      oldPass: '',
      newPass: ''
    });
  }

  // -----------------------------------------------------------
  // ---- 스크랩 리스트 모달 관련
  // -----------------------------------------------------------
  changeScrapListModalState(event) {
    if (event) { event.stopPropagation(); }

    this.isThisProfileForPlayer(() => {
      this.isScrapListModalOpen = !this.isScrapListModalOpen;
    });
  }

  closeScrapListModal(event: boolean) {
    if (event) {
      this.isScrapListModalOpen = false;
    }
  }

  // -----------------------------------------------------------
  // ---- 유저 이미지 변경 모달 관련
  // -----------------------------------------------------------
  openChangingUserImgModal(event) {
    if (event) { event.stopPropagation(); }

    this.isThisProfileForPlayer(() => {
      this.isUserImgModalOpen = !this.isUserImgModalOpen;
    });

  }

  closeUserImgModal(event) {
    this.isUserImgModalOpen = false;
  }


  // ---------------------
  // ---- 기타 범용 함수
  // ---------------------

  isThisProfileForPlayer(cb: Function) {
    if (this.accountInfo.accessToken !== undefined &&
        !hasUserInfoProblem(this.userInfo) &&
        isSameUser(this.accountInfo.accessToken, this.userInfo)) {

      cb();

    }

    // -----------------------------------------------------------
    // ---- 정리용 함수 모음
    // -----------------------------------------------------------

    // 아직 유저정보가 제대로 채워지지 않았을 때 눌렸을 수도 있으니까..
    function hasUserInfoProblem(obj: UserInfo) {
      obj === undefined || obj.id === undefined || obj.id === '' ?
        true : false;
    }

    function isSameUser(accessToken: string, userInfo: UserInfo) {
      const loginUserId = Utils.jwtDecode(accessToken)['userId'];
      if (loginUserId === undefined || loginUserId === '' ||
          loginUserId !== userInfo.id) {

        console.error(`로그인 한 사용자 ${loginUserId}와 프로필 사용자 ${userInfo.id}는 다른 사람이에요.`);
        return false;

      }
      return true;
    }
  }

  stopBubbling(event) {
    if (event) { event.stopPropagation(); }
  }

  ngOnDestroy() {
    Utils.unSubscribe(this.accountSubsc);
    Utils.unSubscribe(this.userInfoSubsc);
    Utils.unSubscribe(this.loginUserInfoSubsc);
  }

}
