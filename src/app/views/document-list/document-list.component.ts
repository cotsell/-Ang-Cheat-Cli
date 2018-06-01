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
  accessToken: string = undefined;
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
      // -----------------------------------------------------------
      // ---- 정리용 함수 모음.
      // -----------------------------------------------------------
      const func = (() => {
        return new Promise((resolve, reject) => {
          this.pause();
        }
        )})();
      // -----------------------------------------------------------
      // ---- 정리용 함수 모음 끝.
      // -----------------------------------------------------------

      func.then(result => {
        this.onInitAfterCheckingAccount();
      });

    });
  }

  // Account 리덕스를 구독해요.
  subscribeAccount() {

    this.accountSubsc = this.store.select(Redux.getAccount)
    .subscribe(result => {
      if (result.reduxState === 'done') {
        if (result.loggedIn) {
          this.isLoggedIn = result.loggedIn;
          this.accessToken = result.accessToken;
        } 

        this.onInitAfterCheckingAccount();
      }
    });
  }

  onInitAfterCheckingAccount() {
    const data = this.route.snapshot.data[0]['userDocu'];
    // console.log(`data: ${data}`);

    
    if (!data) {
      this.searchDocument();
    } else {
      this.searchUserDocuments();
    }
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

    console.log(`검색어 확인`);
    console.log(`${lang}, ${type}, ${subj}`);

    this.network.searchDocument(lang, type, subj, this.cursor)
    .subscribe(result => {
      if (result.result === true) {
        
        this.isNoResult = false;
        this.cursor.totalCount = result.payload.totalCount;
        this.store.dispatch(new NewDocumentList(result.payload.list));

        const ids = this.takeUserIds(result.payload.list);
        this.getUserInfos(ids);

      } else {
        console.log(result.msg);
        this.isNoResult = true;
      }
    });
  }

  // 유저 프로필 등에서 유저가 작성한 문서 리스트를 누르면 작동되는 함수.
  // Access Token이 없을때, 있는데 문서 작성 리스트의 유저 본인이 조회할 때,
  // 있는데 문서 작성 리스트의 유저 본인이 아닌 유저가 조회할 때
  // 이렇게 3가지 모드로 또 나뉘어요.
  // network 함수에서 access token이 있는지 알아서 검사해서 작동시킬거고,
  // 서버에서 access token의 유저와 문서 리스트의 유저가 같은 유저인지 아닌지를
  // 알아서 구분하고 작동시켜요. 
  // 그래서 여기서는 그냥 냅따 데이터가 undefined이든 아니든 때려 넣고 봐요.
  searchUserDocuments() {
    const docuUserId = this.route.snapshot.queryParams['docuUserId'];
    
    this.network.searchUserDocuments(this.accessToken, docuUserId, this.cursor)
    .subscribe(result => {
      if (result.result === true) {
        this.isNoResult = false;
        this.cursor.totalCount = result.payload.totalCount;
        this.store.dispatch(new NewDocumentList(result.payload.list));

        const ids = this.takeUserIds(result.payload.list);
        this.getUserInfos(ids);
      } else {
        console.log(result.msg);
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
    const userDocuMode = this.route.snapshot.data[0]['userDocu'];
    this.cursor.cursor = event;

    if (!userDocuMode) {

      this.searchDocument();
    } else {
      this.searchUserDocuments();
    }
  }

  pause() {
    this.store.dispatch(new RemoveAllDocumentList());
    this.cursor = 
      {
        cursor: 1,
        countPerPage: 30,
        totalCount: 1
      };
  }

  ngOnDestroy() {
    unSubscribe(this.accountSubsc);
    unSubscribe(this.userInfoSubsc);
    unSubscribe(this.docuListSubsc);

    this.store.dispatch(new RemoveAllDocumentList());
  }

}
