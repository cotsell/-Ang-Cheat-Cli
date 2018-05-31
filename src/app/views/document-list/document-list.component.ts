import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxJs';

import * as Redux from '../../service/redux';
import { Network } from '../../service/Network';
import { unSubscribe } from '../../service/utils';
import { UserInfo, DocumentInfo, pageCursor } from '../../service/Interface';
import { NewDocumentList, RemoveAllDocumentList, FillUserInfo } from '../../service/redux/DocumentListReducer';


@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isNoResult = false;
  userInfo: UserInfo;
  docuList: DocumentInfo[];
  cursor: pageCursor = { cursor: 1, countPerPage: 30, totalCount: 1 };

  accountSubsc: Subscription;
  userInfoSubsc: Subscription;
  docuListSubsc: Subscription;

  constructor(
    private route: ActivatedRoute,
    private store: Store<Redux.StoreInfo>,
    private network: Network) { }

  ngOnInit() {
    this.subscribeAccount();
    this.subscribeUserInfo();
    this.subscribeDocumentList();
    this.subscribeRouter();
  }

  // 같은 페이지를 queryParams만 바꿔가면서 리프레쉬 하기 위해서는,
  // activatedRoute를 구독해서 변화를 감지해야 함.
  subscribeRouter() {
    this.route.queryParams
    .subscribe(value => {
      console.log(value);
      this.searchDocument();
    });
  }

  // Account 리덕스를 구독해요.
  subscribeAccount() {

    this.accountSubsc = this.store.select(Redux.getAccount)
    .subscribe(result => {
      if (result.reduxState === 'done') {
        if (result.loggedIn) {
          this.isLoggedIn = result.loggedIn;
        }
      }
    });


    // Delete Me after Testing. 05-23.
    // this.accountSubsc = this.account.loginWithAccessToken(Result => {
    //   this.isLoggedIn = Result.loggedIn;
    //   // this.accessToken = Result.accessToken;
    // });
  }

  // UserInfo 리덕스를 구독해요.
  subscribeUserInfo() {
    this.userInfoSubsc = this.store.select(Redux.getUserInfo)
    .subscribe(Result => {
      if (Result.reduxState === 'done' && Result.id !== undefined) {
        this.userInfo = Result;
      }
    });
  }

  // DocumentList 리덕스를 구독해요.
  subscribeDocumentList() {
    this.docuListSubsc = this.store.select(Redux.getDocumentList)
    .subscribe(Result => {
      this.docuList = Result;
    });
  }

  // 문서를 검색해서 리덕스에 집어 넣어줘요.
  searchDocument() {
    const lang = this.route.snapshot.queryParams['lang'];
    const type = this.route.snapshot.queryParams['type'];
    const subj = this.route.snapshot.queryParams['subj'];

    // console.log(`검색어 확인`);
    // console.log(`${lang}, ${type}, ${subj}`);

    this.network.searchDocument(lang, type, subj, this.cursor)
    .subscribe(value => {
      if (value.result === true) {

        this.isNoResult = false;
        this.cursor.totalCount = value.payload.totalCount;
        this.store.dispatch(new NewDocumentList(value.payload.list));

        const ids = this.takeUserIds(value.payload.list);
        this.getUserInfos(ids);

      } else {
        console.log(value.msg);
        this.isNoResult = true;
      }
    });
  }

  getUserInfos(ids: string[]) {
    this.network.getUserInfos(ids)
    .subscribe(value => {
      if (value.result === true) {
        this.store.dispatch(new FillUserInfo(value.payload));
      } else {
        // TODO UserInfo를 가져오는데 실패를 하면.. 뭘 해줘야 하지?
        console.log('해당 문서들의 유저정보를 가져오는데 실패했어요.');
      }
    });
  }

  // 서버로부터 받아온 문서에서 userId를 추출하고, 중복된 userId를 제거해줘요.
  // 추출한 id들은 userInfo를 서버에 요청하는데 사용해요.
  takeUserIds(doc: DocumentInfo[]): string[] {
    const ids: string[] = [];
    for (const document of doc) {
      const result = ids.find(article => {
        return article === document.userId ? true : false;
      });

      if (result === undefined) {
        ids.push(document.userId);
      }
    }
    return ids;
  }

  // 사용자가 pagination을 사용하면 실행되는 함수에요
  clickedPagination(event) {
    console.log(event);
    // TODO pagination의 상태가 변경되면 해야 할 코드..
    this.cursor.cursor = event;
    this.searchDocument();
  }

  ngOnDestroy() {
    unSubscribe(this.accountSubsc);
    unSubscribe(this.userInfoSubsc);
    unSubscribe(this.docuListSubsc);

    this.store.dispatch(new RemoveAllDocumentList());
  }

}
