/*
    isEditMode: 아무래도 이건 삭제 될 것 같아요.
    isLoggedIn: 로그인 한 상태인지를 알려줍니다. 리덕스 연동.
    isModalOpen: 오류가 발생하면 사용자에게 특정 문구를 보여주기 위한, modal을 보여줄지 결정.
    modalComment: modal에 표시해줄 문자열을 여기에 넣어주고나서 isModalOpen을 true로 변경해주세요.
    modalFunction: modal의 버튼을 누르면 실행 될 함수를 여기에 정의해서 사용할 수 있어요.
        기본적인 작동은 ngOnInit()에 정의되어 있으니, 정의 안하고 기본 기능으로 사용할 수 있어요.
    canUserControlDocument: 로그인 한 사용자가 조회중인 문서의 수정이나 삭제를 할 권한이 있는지
        확인하고, 권한이 있다면 문서조회 화면에 수정, 삭제 버튼을 출력할 수 있도록 결정해줘요.
    accessToken: 로그인 이후 서버로부터 받은 access token을 저장하고 있어요. 수.. 숨겨야 하려나?
    userInfo: user의 정보를 갖는 객체. 기본적으로는 리덕스와 연동해서 정보 유지.
    documentInfo: document의 정보를 갖는 객체. 기본적으로는 리덕스와 연동해서 정보 유지.

    accountSubscription: account 리덕스 구독권. 구독 해지하기 위해 필요.
    userInfoSubscription: userInfo 리덕스 구독권. 구독 해지하기 위해 필요.
    documentSubscription: document 리덕스 구독권. 구독 해지하기 위해 필요.
 */

import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxJs';
import * as marked from 'marked';
import * as prism from 'prismjs';

import { UserInfo, DocumentInfo, Result } from '../../service/Interface';
import { Network } from '../../service/Network';
import * as Utils from '../../service/utils';
import { Store } from '@ngrx/store';
import * as Redux from '../../service/redux';
import Account from '../../service/Account';
import * as DocuDetail from '../../service/redux/DocumentDetailReducer';
import * as conf from '../../service/SysConf';

@Component({
  selector: 'app-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss']
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  @ViewChild('target') target: ElementRef;
  isLoggedIn = false;
  isScrapModalOpen = false;
  canUserControlDocument = false;
  accessToken: string;
  userInfo: UserInfo;
  documentInfo: DocumentInfo;
  thumbUpCount = 0;
  accountSubscription: Subscription;
  userInfoSubscription: Subscription;
  documentSubscription: Subscription;

  // 다용도 모달용
  publicModal = {
    isModalOpen: false,
    leftBtnTitle: undefined,
    leftBtn: undefined,
    rightBtnTitle: undefined,
    rightBtn: undefined,
    comment: undefined
  };

  // 함수들..
  private changeTimeString;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private network: Network,
    private store: Store<Redux.StoreInfo>,
    private account: Account) {
      this.changeTimeString = Utils.changeTimeString;

  }

  ngOnInit() {
    this.subscribeAccountAndTryLoginWithAccessToken();
    this.subscribeUserInfo();
    this.subscribeDocumentDetail();

    this.settingMarked();
  }

  // 모달 닫기 및 데이터 초기화.
  resetPublicModal() {
    this.publicModal.isModalOpen = false;
    this.publicModal.comment = undefined;
    this.publicModal.leftBtnTitle = undefined;
    this.publicModal.leftBtn = undefined;
    this.publicModal.rightBtnTitle = undefined;
    this.publicModal.rightBtn = undefined;
    Utils.bodyScroll(true);
  }

  setPublicModalDefault() {
    this.publicModal.rightBtn = (event) => {
      if (event) { event.stopPropagation() ;}

      this.resetPublicModal();
      this.router.navigate(['/']);
    };
    this.publicModal.rightBtnTitle = "확인";
  }

  showDeleteModal(event) {
    if (event) { event.stopPropagation(); }

    this.resetPublicModal();
    const setting = {
      isModalOpen: true,
      comment: '정말 삭제 하시겠어요?',
      leftBtnTitle: '확인',
      rightBtnTitle: '취소',
      leftBtn: (event) => {
        this.deleteDocument(event);
        this.resetPublicModal();
      },
      rightBtn: (event) => {
        if (event) { event.stopPropagation(); }

        this.resetPublicModal();
      }
    };

    this.publicModal = setting;
    Utils.bodyScroll(false);
  }

  // 서버에 문서 삭제 요청을 하는 함수에요.
  private deleteDocument(event) {
    if (event) { event.stopPropagation(); }

    this.network.removeDocument(this.accessToken, this.documentInfo)
      .subscribe(value => {
        this.router.navigate(['./']);
      });
  }

  // 서버로부터 문서를 가져옵니다.
  private getDocumentFromServer() {
    const docHistoryId = this.route.snapshot.params['id'];

    let observable;
    if (this.accessToken === undefined) {
      observable = this.network.getDocument(docHistoryId);
    } else {
      observable = this.network.getDocument(docHistoryId, this.accessToken);
    }

    observable.subscribe((doc: Result) => {
      if (doc.result === true) {
        console.log('성공적으로 문서를 받았어요.\n');

        this.network.getUserInfo(doc.payload.userId)
        .subscribe(value => {
          if (value.result === true) {
            console.log('문서를 작성한 유저정보 받아오기 성공했어요.');
            const document = Object.assign({}, doc.payload,
              { userInfo: value.payload });
            this.store.dispatch(new DocuDetail.NewDocumentDetail(document));
          } else {
              console.error('문서를 작성한 유저정보 받아오기 실패했어요.');
              alert('문서를 작성한 유저정보 받아오기 실패했어요.');
              this.router.navigate(['/']);
          }
        });

        this.getThumbUpCount();
      } else {

        this.setPublicModalDefault(); // 모달 세팅.

        if (doc.code === 2) {
          const comment = '문서를 받아오는데 실패 했어요.\n';
          this.publicModal.comment = comment;
          this.publicModal.isModalOpen = true;
          Utils.bodyScroll(false);
        } else if (doc.code === 3) {
          this.publicModal.comment = doc.msg;
          this.publicModal.isModalOpen = true;
          Utils.bodyScroll(false);
        }
      }
    });
  }

  // 엄지척 갯수를 가져와요.
  private getThumbUpCount() {
    this.network.getThumbUpCount(this.documentInfo.historyId)
      .subscribe(result => {
        if (result.result === true) {
          console.log(result.msg);
          this.thumbUpCount = result.payload;
        } else {
          console.error(result.msg);
        }
      });
  }

  private changeEditMode(event?) {
    if (event) { event.stopPropagation(); }

    this.router.navigate(['./writeDocu', this.documentInfo.historyId, 'edit']);
  }

  // TODO 미완성.
  private clickEvent(event) {
    if (event) { event.stopPropagation(); }
  }

  // account 리덕스를 구독하고,
  // 내친김에 로컬 저장소에 AccessToken과 userId가 있다면, 로그인을 시도합니다.
  private subscribeAccountAndTryLoginWithAccessToken() {
    this.accountSubscription = this.account.loginWithAccessToken(result => {
      this.isLoggedIn = result.loggedIn;
      this.accessToken = result.accessToken;
      this.getDocumentFromServer();
    },
    () => {
      this.getDocumentFromServer();
    });
  }

  // UserInfo 리덕스를 구독해요.
  private subscribeUserInfo() {
    this.store.select(Redux.getUserInfo)
      .subscribe(userInfo => {
        this.userInfo = userInfo;
        this.changeDocCtrlState();
      });
  }

  // DocumentDetail 리덕스를 구독해요.
  private subscribeDocumentDetail() {
    this.store.select(Redux.getDocumentDetail)
      .subscribe(doc => {
        this.documentInfo = Object.assign({}, doc);
        this.changeDocCtrlState();
        this.renderMarkdownAndPrism();
      });
  }

  // 문서 수정 버튼을 출력할 것인지를 결정.
  private changeDocCtrlState() {
    if (this.documentInfo !== undefined && this.userInfo !== undefined) {
      if (this.documentInfo.userId === this.userInfo.id) {
        this.canUserControlDocument = true;
      }
    }
  }

  // Tags 컴포넌트에서 새로운 태그가 입력되면 이게 실행돼요.
  sendNewTag(event) {

    if (this.accessToken !== undefined && this.accessToken !== '' &&
        this.userInfo.id === this.documentInfo.userId ) {

      this.network.newTag(this.accessToken, this.documentInfo._id, event)
      .subscribe(value => {
        if (value.result === true) {
          console.log(value.msg);
          this.store.dispatch(new DocuDetail.AddNewTagArticle(event));
        } else {
          if (value.code === 1) {
            console.log('엑세스토큰에 문제가 생겼어요.');
            alert(conf.MSG_DOCUMENT_DETAIL_ACCESS_TOKEN_ERROR);
            this.router.navigate(['/']);
          } else {
            // TODO 삭제 실패시 처리...
          }
        }
      });
    } else {
      console.error(`비 로그인 상태이거나, 로그인 유저가 문서 작성자가 아니에요.`);
    }
  }

  // Tags 컴포넌트에서 태그 삭제가 요청되면 이게 실행돼요.
  removeTagArticle(event) {

    if (this.accessToken !== undefined && this.accessToken !== '' &&
        this.userInfo.id === this.documentInfo.userId ) {

      this.network.removeTag(this.accessToken, this.documentInfo._id, event)
      .subscribe(value => {
        if (value.result === true) {
          console.log(value.msg);
          this.store.dispatch(new DocuDetail.RemoveTagArticle(event));
        } else {
          if (value.code === 1) {
            console.log('엑세스토큰에 문제가 생겼어요.');
            alert(conf.MSG_DOCUMENT_DETAIL_ACCESS_TOKEN_ERROR);
            // TODO 엑세스토큰 만료 요류라면 로그아웃 처리 필요.
          } else {
            // TODO 삭제 실패시 처리...
          }
        }
      });
    } else {
      console.error(`비 로그인 상태이거나, 로그인 유저가 문서 작성자가 아니에요.`);
    }
  }

  private scrap(event) {
    if (event) { event.stopPropagation(); }

    if (this.accessToken !== undefined && 
        this.userInfo !== undefined && this.userInfo.id !== undefined) {

      this.isScrapModalOpen = true;
    } else {
      console.error(`비 로그인 상태에요.`)
    }
  }

  private thumbUp(event) {
    if (event) { event.stopPropagation(); }

    if (this.accessToken !== undefined && 
        this.userInfo !== undefined && this.userInfo.id !== undefined) {

      this.network.setThumbUp(this.accessToken, this.documentInfo.historyId)
      .subscribe(result => {
        if (result.result === true) {
          console.log(result.msg);
          this.thumbUpCount = result.payload;
        } else {
          // TODO 실패했을 시..
          console.error(result.msg);
        }
      });
    } else {
      console.error(`비로그인 상태에요.`)
    }
  }

  // -----------------------------------------------------------
  // ---- MarkDown & PrismJS
  // -----------------------------------------------------------
  private settingMarked() {
    marked.setOptions({
      renderer: new marked.Renderer(),
      gfm: true,
      tables: true,
      breaks: true,
      pedantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: false,
      xhtml: true
    });
  }

  // 문서내에 있는 마크다운과 코드 하이라이팅을 적용해서 다시 화면 랜더링.
  private renderMarkdownAndPrism() {
    if (this.documentInfo.text !== undefined) {
      this.target.nativeElement.innerHTML = marked(this.documentInfo.text);
      prism.highlightAllUnder(this.target.nativeElement);
    }
  }

  ngOnDestroy() {
    Utils.unSubscribe(this.accountSubscription);
    Utils.unSubscribe(this.userInfoSubscription);
    Utils.unSubscribe(this.documentSubscription);
    this.store.dispatch(new DocuDetail.RemoveDocumentDetail());
  }

}
