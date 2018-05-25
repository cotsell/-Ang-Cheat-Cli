import { Component, OnInit, Input, Output, OnDestroy, OnChanges, EventEmitter, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Scrap, Account as iAccount } from '../../service/Interface';
import { Network } from '../../service/Network';
import { Store } from '@ngrx/store';
import * as Redux from '../../service/redux';
import { Subscription } from 'rxJs';
import * as utils from '../../service/utils';

@Component({
  selector: 'app-scrap-list-modal',
  templateUrl: './scrap-list-modal.component.html',
  styleUrls: ['./scrap-list-modal.component.scss']
})
export class ScrapListModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() on: boolean;
  @Output() exit = new EventEmitter<boolean>();

  @Input() userId: string;
  scrapList: Scrap;
  accountInfo: iAccount = 
    { loggedIn: false, accessToken: undefined, reduxState: 'none' };
  accountSubc: Subscription;

  constructor(
    private network: Network,
    private router: Router,
    private store: Store<Redux.StoreInfo>
  ) { }

  ngOnInit() {
    if (this.on) {
      this.subscribeAccount();
      utils.bodyScroll(false);
    }
  }

  private subscribeAccount() {
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

  afterCheckingAccount() {
    // TODO 계정 구독 이후에 처리해줘야 하는 것들을 여기에 작성.

    this.getScrapListFromServer();
  }

  getScrapListFromServer() {
    this.network.getScrap(this.accountInfo.accessToken)
      .subscribe(result => {
        if (result.result === true) {
          console.log(result.msg);
          this.scrapList = result.payload;
        } else {
          // TODO
          console.error(result.msg);
        }
      });
  }

  // 스크랩 항목에 마우스를 올리면 삭제 버튼 출력 여부
  showCloseBtn(event, label: string, index?: number) {
    if (event) { event.stopPropagation(); }

    let targetId;
    if (index !== undefined) {
      targetId = 'CLASS' + label + index;
    } else {
      targetId = 'CLASS' + label;
    }
    
    document.getElementById(targetId).className = 'material-icons showIcon';
  }

  // 스크랩 항목에 마우스를 올리면 삭제 버튼 출력 여부
  hideCloseBtn(event, label: string, index?: number) {
    if (event) { event.stopPropagation(); }

    let targetId;
    if (index !== undefined) {
      targetId = 'CLASS' + label + index;
    } else {
      targetId = 'CLASS' + label;
    }
    document.getElementById(targetId).className = 'material-icons hideIcon';
  }

  // 항목 클릭하면 항목 내용보러, 페이지 조회 페이지로 이동.
  showDocument(event, docuId: string) {
    if (event) { event.stopPropagation(); }

    this.router.navigate(['/docuDetail', docuId]);
  }

  deleteArticle(event, label: string, docuId?: string) {
    if (event) { event.stopPropagation(); }

    let msg = {};

    if (docuId !== undefined) {
      msg = { label, docuId };
    } else {
      msg = { label };
    }

    // console.log(msg);
    this.network.removeScrap(this.accountInfo.accessToken, msg)
      .subscribe(result => {
        if (result.result === true) {
          console.log(result.msg);
          console.log(result.payload);
          this.scrapList = result.payload;
        } else {
          // TODO
          console.error(result.msg);
        }
      });

  }

  filteringDocuList(label: string) {
    return this.scrapList.docuList.filter(article => {
      return article.label === label ? true : false;
    });
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

  pause() {
    utils.unSubscribe(this.accountSubc);
    utils.bodyScroll(true);
  }

  closeModal(event) {
    if (event) { event.stopPropagation(); }

    this.exit.emit(true);
  }

  ngOnDestroy() {
    utils.unSubscribe(this.accountSubc);
  }

}
