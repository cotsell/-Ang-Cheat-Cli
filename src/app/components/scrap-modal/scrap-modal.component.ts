import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Scrap, DocumentInfo, Account as iAccount } from '../../service/Interface';
import { Network } from '../../service/Network';
import { Store } from '@ngrx/store';
import * as Redux from '../../service/redux';
import { Subscription } from 'rxJs';
import { unSubscribe, bodyScroll } from '../../service/utils';

@Component({
  selector: 'app-scrap-modal',
  templateUrl: './scrap-modal.component.html',
  styleUrls: ['./scrap-modal.component.scss']
})
export class ScrapModalComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('labelName') labelName: ElementRef;
  @Input() on: boolean;
  @Input() document: DocumentInfo;
  @Output() makeScrap = new EventEmitter<any>();
  @Output() exit = new EventEmitter<boolean>();

  accountInfo: iAccount = 
    { loggedIn: false, accessToken: undefined, reduxState: 'none' };
  scrapList: Scrap;
  isMakeNewOpen = false;

  accountSubc: Subscription;

  constructor(
    private network: Network,
    private store: Store<Redux.StoreInfo>
  ) { }

  ngOnInit() {
    if (this.on) {
      this.subscribeAccount();
      bodyScroll(false);
    }
  }

  subscribeAccount() {
    this.accountSubc = this.store.select(Redux.getAccount)
    .subscribe(result => {
      if (result.reduxState === 'done') {
        if (result.loggedIn) {
          this.accountInfo = result;
          this.afterCheckingAccount();
        } else {
          this.exit.emit(true);
        }
      }
    });
  }

  // 로그인이 된게 확실했을때 다음을 실행하기 위해 사용하는 함수.
  afterCheckingAccount() {
    this.getScrapList();
  }

  // 로그인 한 유저의 스크랩 리스트를 가져와요.
  getScrapList() {
    this.network.getScrap(this.accountInfo.accessToken)
    .subscribe(result => {
      if (result.result === true) {
        console.log(result.msg);
        this.scrapList = Object.assign({}, result.payload);
      } else {
        console.error(result.msg);
      }
    });
  }

  // 스크랩 저장하기 함수.
  // label값이 들어오면 기존 라벨을 이용한 스크랩이고,
  // label값이 없으면, 새로 라벨을 만들어서 스크랩하는 거로 처리해요.
  makeScrapBtn(event, label?: string) {
    if (event) { event.stopPropagation(); }

    let labelObj: any;

    if (label) {
      // 기존 라벨 이용해서 만들기.
      labelObj = {
        isNew: false,
        documentId: this.document.historyId,
        documentTitle: this.document.title,
        label: label
      };

    } else {
      // 새로 만들기
      labelObj = {
        isNew: true,
        documentId: this.document.historyId,
        documentTitle: this.document.title,
        label: this.labelName.nativeElement.value
      };
    }

    if (labelObj.label === undefined || labelObj.label === '') {
      alert(`라벨 이름은 공백을 허용하지 않아요.`);
    } else if (this.accountInfo.reduxState === 'done' && this.accountInfo.loggedIn) {
     
      this.network.setScrap(this.accountInfo.accessToken, labelObj)
      .subscribe(result => {
        if (result.result === true) {
          console.log(result.msg);
          this.closeModal(undefined);
        } else {
          console.error(result.msg);
          alert(result.msg);
        }
      });
    }
  }

  // 새로운 라벨 만들기 항목 화면에 표시하기, 말기.
  changeMakeNewState(event) {
    if (event) { event.stopPropagation(); }

    this.isMakeNewOpen = !this.isMakeNewOpen;
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(`ScrapModal CHANGES 상태..`);
    // console.log(changes);
    if (this.on) {
      this.ngOnInit();
    } else {
      this.pause();
    }
  }

  // on 상태가 false면 정지상태이므로
  pause() {
    unSubscribe(this.accountSubc);
    this.scrapList = undefined;
    this.accountInfo = 
      { loggedIn: false, accessToken: undefined, reduxState: 'none' };
    this.isMakeNewOpen = false;
    bodyScroll(true);
  }

  closeModal(event) {
    if (event) { event.stopPropagation(); }

    this.exit.emit(true);
  }

  ngOnDestroy() {
    unSubscribe(this.accountSubc);
  }

}
