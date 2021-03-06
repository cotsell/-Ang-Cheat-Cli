import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxJs';

import * as Redux from '../../service/redux';
import { ModifyAccount, NewAccount } from '../../service/redux/AccountReducer';
import { NewUserInfo, RemoveUserInfo } from '../../service/redux/UserInfoReducer';
import * as Utils from '../../service/utils';
import * as SysConf from '../../service/SysConf';
import { UserInfo } from '../../service/Interface';
import { Network } from '../../service/Network';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  signupMode = false;
  userInfo: UserInfo;

  accountSubscription: Subscription;
  userInfoSubscription: Subscription;

  // 로그인 관련 폼 설정
  loginForm: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  // 가입 관련 폼 설정.
  signupForm: FormGroup = new FormGroup({
    id: new FormControl('', [Validators.email, Validators.required]),
    nickName: new FormControl('', 
      [Validators.required, Validators.minLength(5)]),
    passwordsGroup: new FormGroup({
      password: new FormControl('', 
        [Validators.minLength(8), Validators.required]),
      confirm: new FormControl('')
    }, this.equalPassword)
  });

  constructor(
    private store: Store<Redux.StoreInfo>,
    private network: Network) { }

  ngOnInit() {
    this.subscribeAccount();
    this.subscribeUserInfo();
  }

  // Account 리덕스를 구독해요.
  subscribeAccount() {
    this.accountSubscription = this.store.select(Redux.getAccount)
    .subscribe(obs => {
      if (obs.reduxState === 'done') {
        this.isLoggedIn = obs.loggedIn;
      }
    });
  }

  // UserInfo 리덕스를 구독해요.
  subscribeUserInfo() {
    this.userInfoSubscription = this.store.select(Redux.getUserInfo)
    .subscribe(obs => {
      if (obs.reduxState === 'done' && obs.id !== undefined) {
        this.userInfo = obs;
      }
    });
  }

  login(event) {
    if (event) { event.stopPropagation(); }

    if (this.loginForm.valid) {
      console.log(`loginForm의 유효성 검사 결과는 ${this.loginForm.valid}`);
      this.network.login( this.loginForm.value['id'],
                          this.loginForm.value['password'])
      .subscribe(loginResult => {
        const result = loginResult.result;

        if (result === true) { // 로그인 성공 시..
          const accessToken = loginResult.payload.accessToken;
          const userId = Utils.jwtDecode(accessToken)['userId'];

          localStorage.setItem(SysConf.LOCAL_STORAGE_ACCESS_TOKEN, accessToken);

          this.store.dispatch(new NewAccount(
            { accessToken: accessToken, loggedIn: true, reduxState: 'done' }));

          this.network.getUserInfo(userId)
          .subscribe(userInfoResult => {
            if (userInfoResult.result === true) {
              this.store.dispatch(new NewUserInfo(
                { ...userInfoResult.payload, reduxState: 'done' }));
            } else {
              // TODO 유저정보 가져오기 실패시에는??
              this.store.dispatch(new NewUserInfo(
                { reduxState: 'done' }));
            }
          });
        } else {
          // TODO ID, PASSWORD 로그인 실패시 대응 코딩.
          console.log('로그인 실패: ' + JSON.stringify(loginResult));
        }
      });
    } else {
      alert(`ID와 PASSWORD를 입력 해주세요.`);
    }

    
  }

  // 로그아웃 버튼을 누르면, 로컬 저장소의 계정 정보를 모두 삭제하고,
  // 리덕스의 로그인 관련 정보를 모두 삭제해요.
  logout(event) {
    if (event) { event.stopPropagation(); }

    localStorage.removeItem(SysConf.LOCAL_STORAGE_ACCESS_TOKEN);

    this.store.dispatch(new ModifyAccount(
      { accessToken: undefined, loggedIn: false, reduxState: 'none' }));

    this.store.dispatch(new RemoveUserInfo());
  }

  show_signup(event) {
    if (event) { event.stopPropagation(); }

    this.signupMode = !this.signupMode;
  }

  signup(event) {
    if (event) { event.stopPropagation(); }

    if (this.signupForm.valid) {
      // console.log(`signupForm 검사 결과 : ${this.signupForm.valid}`);
      // console.log(this.signupForm.value);
      const { id, passwordsGroup, nickName } = this.signupForm.value;
      this.network.signup(id, passwordsGroup.password, nickName)
      .subscribe(Result => {
        if (Result.result === true) { // 가입 성공하면, 로그인 시도.
          const { result, payload } = Result;
          const accessToken = payload.accessToken;
          const userId = Utils.jwtDecode(accessToken)['userId'];

          // 가입 성공 후 받아온 accessToken과 userID를 로컬저장소에 저장.
          localStorage.setItem(SysConf.LOCAL_STORAGE_ACCESS_TOKEN, accessToken);

          // 리덕스에 access token과 로그인 상태 true를 갱신.
          // 로그인 한거로 간주합니다.
          this.store.dispatch(new NewAccount({
            accessToken: accessToken,
            loggedIn: true,
            reduxState: 'done'
          }));

          // 로그인 된 유저 정보를 요청합니다.
          this.network.getUserInfo(userId)
            .subscribe(userInfoResult => {
              if (userInfoResult.result === true) {
                this.store.dispatch(new NewUserInfo(
                  { ...userInfoResult.payload, reduxState: 'done'}));
              } else {
                // TODO 유저 정보 조회 실패시의 대응??
              }
            });
        } else {
          // TODO 가입 실패 하면, 어떻게 할지 코딩 필요.
          // TODO 가입 실패 사유를 표기한다거나..
          console.error('가입 실패: ' + Result['msg']);
          this.signupForm.setValue(
            {
              id: this.signupForm.value['id'],
              nickName: this.signupForm.value['nickName'],
              passwordsGroup: {
                password: '',
                confirm: ''
              }
            }
          );
        }
      });
    }
  }

  // -----------------------------------------------------------
  // ---- Form 유효성 검사 함수들.
  // -----------------------------------------------------------

  checkControl(name: string | string[]) {
    const control = this.signupForm.get(name);
    if (control.errors === null) {
      return false;
    }
    return true;
  }

  // 폼 그룹을 받아와서 컨트롤들이 같은 값을 가졌는지 확인해요.
  equalPassword({ value }: FormGroup): { [key: string]: any } {
    // console.log(value);
    if (value.password === value.confirm &&
        value.confirm !== '') {
      return null;
    }
    return { equalPassword: true };
  }

  // -----------------------------------------------------------
  // ---- 기타 함수.
  // -----------------------------------------------------------
  stopBubbling(event) {
    if (event) { event.stopPropagation(); }
  }

  ngOnDestroy() {
    Utils.unSubscribe(this.accountSubscription);
    Utils.unSubscribe(this.userInfoSubscription);
  }
}
