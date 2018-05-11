import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import * as Redux from '../../service/redux';
import { Network } from '../../service/Network';
import { Subscription } from 'rxJs';
import { DocumentInfo, UserInfo, Reply } from '../../service/Interface';
import * as util from '../../service/utils';
import * as conf from '../../service/SysConf';

@Component({
  selector: 'app-reply-list',
  templateUrl: './reply-list.component.html',
  styleUrls: ['./reply-list.component.scss']
})
export class ReplyListComponent implements OnInit, OnDestroy {
  @ViewChild('textarea') textarea: ElementRef;
  private isReplyEditMode = false;
  private document: DocumentInfo;
  private userInfo: UserInfo;
  private account: { logged: boolean, accessToken: string };
  private replyList: Reply[] = [];

  private accountSubc: Subscription;
  private userInfoSubc: Subscription;
  private documentSubc: Subscription;

  constructor(
    private store: Store<Redux.StoreInfo>,
    private network: Network) { }

  ngOnInit() {
    this.subscribeAccount();
    this.subscribeUserInfo();
    this.subscribeDocument();
  }

  private subscribeAccount() {
    this.accountSubc = this.store.select(Redux.getAccount)
      .subscribe(value => {
        this.account = {
          logged: value.loggedIn,
          accessToken: value.accessToken
        };
      });
  }

  private subscribeUserInfo() {
    this.userInfoSubc = this.store.select(Redux.getUserInfo)
      .subscribe(value => {
        this.userInfo = value;
      });
  }

  // document를 구독하고, 해당 문서의 리플을 가져와요.
  private subscribeDocument() {
    this.documentSubc = this.store.select(Redux.getDocumentDetail)
      .subscribe(value => {
        this.document = value;

        if (value !== undefined) {
          this.getReply();
        }
      });
  }

  // 리플작성 화면 화면에 보여줄까 말까
  private changeReplyEditMode(event) {
    if (event) { event.stopPropagation(); }

    this.isReplyEditMode = !this.isReplyEditMode;
  }

  // 새로운 리플 작성.
  private submitReply(event) {
    if (event) { event.stopPropagation(); }

    const reply: Reply = {
      parentId: this.document.historyId,
      text: this.textarea.nativeElement.value,
      userId: this.userInfo.id
    };

    this.network.makeReply(this.account.accessToken, reply)
      .subscribe(result => {
        if (result.result === true) {
          console.log(result.msg);
          console.log(result.payload);
          this.textarea.nativeElement.value = '';
          this.changeReplyEditMode(undefined);
          // TODO 리덕스로 변경 필요하겠지.
          this.replyList.push(result.payload);
        } else {
          // TODO 실패했으면?
          alert(conf.MSG_REPLY_MAKE_REPLY_ERR);
        }
      });
  }

  // 새로운 리리플 작성.
  private submitRereply(event) {
    const reply: Reply =
      Object.assign({}, {...event, userId: this.userInfo.id });

    this.network.makeRereply(this.account.accessToken, reply)
      .subscribe(result => {
        if (result.result === true) {
          // TODO 성공시. 리덕스 연결 필요.
          this.replyList = this.replyList.map(value => {
            if (value._id === result.payload._id) {
              value = Object.assign({}, result.payload);
            }
            return value;
          });
        } else {
          // TODO 실패시..
          alert(conf.MSG_REPLY_MAKE_REPLY_ERR);
        }
      });
  }

  // 해당 문서의 리플 가져오기.
  private getReply() {
    this.network.getReply(this.document.historyId)
      .subscribe(result => {
        if (result.result === true) {
          this.replyList = result.payload;
        } else {
          if (result.code === 3) {
            // 배열이 비었을 때
            this.replyList = [];
          } else if (result.code === 4) {
            // TODO 그냥 가져오기 오류
            alert(conf.MSG_REPLY_GET_ALL_ERR);
          }
        }
      });
  }

  // 리플 삭제.
  private removeReply(event) {
    const replyId = event;
    this.network.removeReply(this.account.accessToken, replyId)
      .subscribe(result => {
        if (result.result === true) {
          // TODO 그냥 전체 리플을 다시 받는게 나으려나..;;
          console.log(result.payload);

          this.replyList = this.replyList.map(value => {
            return value.historyId === result.payload.historyId ?
              result.payload : value;
          });
        } else {
          // TODO
          console.error(result.msg);
        }
      });
  }

  // 리리플 삭제
  private removeRereply(event) {
    const rereply = event;

    this.network.removeRereply(this.account.accessToken, rereply)
      .subscribe(result => {
        if (result.result === true) {
          console.log(result.msg);
          this.replyList = this.replyList.map(value => {
            return value._id === result.payload._id ?
                Object.assign({}, result.payload) : value;
          });
        } else {
          alert(conf.MSG_REREPLY_REMOVE_REREPLY_ERR);
        }
      });
  }

  // 리플 업데이트
  private updateReply(event) {
    console.log(event);

    this.network.updateReply(this.account.accessToken, event)
      .subscribe(result => {
        if (result.result === true) {
          console.log(result.msg);
          console.log(result.payload);
          this.replyList = this.replyList.map(value => {
            if (value.historyId === result.payload.historyId) {
              value = result.payload;
            }
            return value;
          });
        } else {
          // TODO 실패.
          console.log(result.msg);
        }
      });
  }

  // 리리플 업데이트
  private updateRereply(event) {
    console.log(event);

    this.network.updateRereply(this.account.accessToken, event)
      .subscribe(result => {
        if (result.result === true) {
          // TODO TEST
          console.log(result.msg);
          console.log(result.payload);
          this.replyList = this.replyList.map(value => {
            if (value._id === result.payload._id) {
              value = Object.assign({}, result.payload);
            }
            return value;
          });
        } else {
          // TODO
          console.log(result.msg);
        }
      });
  }

  ngOnDestroy() {
    util.unSubscribe(this.documentSubc);
    util.unSubscribe(this.userInfoSubc);
    util.unSubscribe(this.accountSubc);
  }
}
