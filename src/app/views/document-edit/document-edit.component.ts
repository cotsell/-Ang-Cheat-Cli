import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Network } from '../../service/Network';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxJs';

import * as Redux from '../../service/redux';
import Account from '../../service/Account';
import { UserInfo } from '../../service/Interface';
import * as Utils from '../../service/utils';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss']
})
export class DocumentEditComponent implements OnInit, OnDestroy {
  private isLoggedIn = false;
  private isPreviewMode = false;
  private accessToken: string;
  private relatedId: string;
  private previewText: string;
  private userInfo: UserInfo;
  private accountSubscription: Subscription;
  private userInfoSubscription: Subscription;

  textForm: FormGroup = new FormGroup(
    {
      title: new FormControl(),
      text: new FormControl()
    }
  );


  constructor(
    private route: ActivatedRoute,
    private account: Account,
    private network: Network,
    private store: Store<Redux.StoreInfo>) { }

  ngOnInit() {
    this.subscribeAccountAndTryLogin();
    this.subscribeUserInfo();

    this.relatedId = this.route.snapshot.params['relatedId'];
    if (this.relatedId !== undefined && this.relatedId !== null) {
      // TODO 입력된 연관아이디가 존재.
      console.log(this.relatedId);

    } else {
      // TODO 입력된 연관아이디가 없음.
      console.log(this.relatedId);
    }

  }

  // Account 리덕스를 구독하고, 미 로그인 상태일 시, 로컬 저장소를 살펴보고,
  // AccessToken이 있다면, 로그인을 시도해요.
  // 로그인 실패시에는 두번째 인자로 들어가는 콜백함수를 호출해요.
  private subscribeAccountAndTryLogin() {
    this.accountSubscription = this.account.loginWithAccessToken(
      result => {
        this.isLoggedIn = result.loggedIn;
        this.accessToken = result.accessToken;
      },
      () => {
        // TODO 로그인 실패시 내용 코딩
      }
    );
  }

  private subscribeUserInfo() {
    this.userInfoSubscription = this.store.select(Redux.getUserInfo)
      .subscribe(Result => {
        this.userInfo = Result;
      });
  }

  // 작성한 문서를 서버에 저장합니다.
  private sendNewText(event) {
    event.stopPropagation();
    const document = {
        title: this.textForm.value['title'],
        text: this.textForm.value['text']
      };
    this.network.newDocument(this.accessToken, document);
  }

  // 에디터 화면에 작성주인 내용을 우측의 프리뷰 화면에 출력하기 위한
  private copyTextToPreview(event) {
    this.previewText = this.textForm.value.text;
    // this.previewText = event.target.value;
  }

  ngOnDestroy() {
    Utils.unSubscribe(this.accountSubscription);
    Utils.unSubscribe(this.userInfoSubscription);
  }

}
