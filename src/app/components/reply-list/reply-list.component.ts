import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import * as Redux from '../../service/redux';
import { Network } from '../../service/Network';
import { Subscription } from 'rxJs';
import { DocumentInfo, UserInfo, Reply, Account as iAccount } from '../../service/Interface';
import * as util from '../../service/utils';
import * as conf from '../../service/SysConf';

@Component({
  selector: 'app-reply-list',
  templateUrl: './reply-list.component.html',
  styleUrls: ['./reply-list.component.scss']
})
export class ReplyListComponent implements OnInit, OnDestroy {
  @ViewChild('textarea') textarea: ElementRef;
  isReplyEditMode = false;
  document: DocumentInfo;
  userInfo: UserInfo;
  userInfos: UserInfo[] = [];

  accountInfo: iAccount = 
    { loggedIn: false, accessToken: undefined, reduxState: 'none' };
  replyList: Reply[] = [];

  accountSubc: Subscription;
  userInfoSubc: Subscription;
  documentSubc: Subscription;

  constructor(
    private store: Store<Redux.StoreInfo>,
    private network: Network) { }

  ngOnInit() {
    this.subscribeAccount();
    this.subscribeUserInfo();
    this.subscribeDocument();
  }

  subscribeAccount() {
    this.accountSubc = this.store.select(Redux.getAccount)
    .subscribe(value => {
      if (value.reduxState === 'done' && value.loggedIn) {
        this.accountInfo = value;
      }
    });
  }

  subscribeUserInfo() {
    this.userInfoSubc = this.store.select(Redux.getUserInfo)
      .subscribe(value => {
        if (value.reduxState === 'done' && value.id !== undefined) {
          this.userInfo = value;
        }
      });
  }

  // document를 구독하고, 해당 문서의 리플을 가져와요.
  subscribeDocument() {
    this.documentSubc = this.store.select(Redux.getDocumentDetail)
      .subscribe(value => {
        this.document = value;

        if (value !== undefined) {
          this.getReply();
        }
      });
  }

  // 리플작성 화면 화면에 보여줄까 말까
  changeReplyEditMode(event) {
    if (event) { event.stopPropagation(); }

    if (this.accountInfo.reduxState === 'done' && this.accountInfo.loggedIn &&
        this.userInfo.reduxState === 'done' && this.userInfo.id !== undefined) {
      this.isReplyEditMode = !this.isReplyEditMode;
    } else {
      console.error(`로그인 하고 이용 해 주세요.`);
    }
  }

  // 새로운 리플 작성.
  submitReply(event) {
    if (event) { event.stopPropagation(); }

    if (this.accountInfo.reduxState === 'done' && this.accountInfo.loggedIn &&
        this.userInfo.reduxState === 'done' && this.userInfo.id !== undefined) {

      const reply: Reply = {
        parentId: this.document.historyId,
        text: this.textarea.nativeElement.value,
        userId: this.userInfo.id
      };
  
      this.network.makeReply(this.accountInfo.accessToken, reply)
      .subscribe(result => {
        if (result.result === true) {
          console.log(result.msg);
          console.log(result.payload);
          this.textarea.nativeElement.value = '';
          this.changeReplyEditMode(undefined);
          // TODO 리덕스로 변경 필요하겠지.
          // this.replyList.push(result.payload);
          const replyList = [...this.replyList];
          replyList.push(result.payload);
          this.getUserInfosAndSet(replyList);
        } else {
          // TODO 실패했으면?
          alert(conf.MSG_REPLY_MAKE_REPLY_ERR);
        }
      });

    } else {
      console.error(`로그인 하지 않았어요.`);
      this.textarea.nativeElement.value = '';
      this.changeReplyEditMode(undefined);
    }
  }

  // 새로운 리리플 작성.
  submitRereply(event) {

    if (this.accountInfo.reduxState === 'done' && this.accountInfo.loggedIn &&
        this.userInfo.reduxState === 'done' && this.userInfo.id !== undefined) {

      const reply: Reply =
        Object.assign({}, {...event, userId: this.userInfo.id });
    
      this.network.makeRereply(this.accountInfo.accessToken, reply)
      .subscribe(result => {
        if (result.result === true) {
          // TODO 성공시. 리덕스 연결 필요.
  
          const replyList = this.replyList.map(value => {
            if (value._id === result.payload._id) {
              value = Object.assign({}, result.payload);
            }
            return value;
          });
          this.getUserInfosAndSet(replyList);
  
        } else {
          // TODO 실패시..
          alert(conf.MSG_REPLY_MAKE_REPLY_ERR);
        }
      });
    }
    
  }

  // 해당 문서의 리플 가져오기.
  getReply() {
    this.network.getReply(this.document.historyId)
      .subscribe(result => {
        if (result.result === true) {
          this.getUserInfosAndSet(result.payload);

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

  getUserInfosAndSet(replyList: Reply[]) {
    const ids = takeUserIds(replyList);

    this.network.getUserInfos(ids)
    .subscribe(users => {

      if (users.result === true) {

        replyList = replyList.map(reply => {

          if (reply.rereply !== undefined && reply.rereply.length > 0) {
            reply.rereply = reply.rereply.map(rereply => {
              const result = users.payload.find(user => {
                return user.id === rereply.userId ? true : false;
              });
              if (result !== undefined) {
                rereply.userInfo = result;
              }

              // parentUserNickName도 여기서 설정.
              rereply.parentUserNickName =
                findNickName(rereply.parentUserId, users.payload);
              return rereply;
            });
          }

          const result = users.payload.find(user => {
            return user.id === reply.userId ? true : false;
          });
          if (result !== undefined) {
            reply.userInfo = result;
          }
          return reply;
        });

        this.replyList = replyList;
      }
    });

    // -----------------------------------------------------------
    // ---- 정리용도 함수 모음 시작

    // 서버로부터 받아온 리플들에서 userId를 추출하고, 중복된 userId는 제거할꺼에요.
    // 추출한 id들은 서버에 ninkName을 요청하는데 사용 할 거에요.
    function takeUserIds(replyList: Reply[]) {
      // -----------------------------------------------------------
      // ---- 정리용도 함수 모음.

      const func = (obj: Reply) => {
        return ids.find(f => {
          return obj.userId === f ? true : false;
        });
      }

      // ---- 정리용도 함수 모음 끝.
      // -----------------------------------------------------------
      const ids: string[] = [];

      for (const reply of replyList) {
        if(reply.rereply !== undefined && reply.rereply.length > 0) {
          reply.rereply.map(value => {
            if (func(value) === undefined) {
              ids.push(value.userId);
            }
          });
        }

        if (func(reply) === undefined) {
          ids.push(reply.userId);
        }
      }

      return ids;
    }


    function findNickName(userId: string, infos: any) {
      return infos.find(f => {
        return f.id === userId;
      })
      .nickName;
    }

    // ---- 정리용도 함수 모음 끝
    // -----------------------------------------------------------
  }

  // 리플 삭제.
  removeReply(event: Reply) {
    const reply: Reply = event;
    const replyId = event._id;

    if (this.accountInfo.reduxState === 'done' && this.accountInfo.loggedIn &&
        this.userInfo.reduxState === 'done' && this.userInfo.id !== undefined) {

      if (reply.userId === this.userInfo.id) {
        this.network.removeReply(this.accountInfo.accessToken, replyId)
        .subscribe(result => {
          if (result.result === true) {
            // TODO 그냥 전체 리플을 다시 받는게 나으려나..;;
            // console.log(result.payload);

            const replyList = this.replyList.map(value => {
              return value.historyId === result.payload.historyId ?
                result.payload : value;
            });
            this.getUserInfosAndSet(replyList);
          } else {
            // TODO
            console.error(result.msg);
          }
        });
      } else {
        console.error(`댓글 작성자 ${ reply.userId }와 로그인 사용자 ${ this.userInfo.id }는 다른 사람이에요.`);
      }

    } else {
      console.error(`로그인 이후 이용해주세요.`);
    }

  }

  // 리리플 삭제
  removeRereply(event: Reply) {
    const rereply = event;
    // console.log(event);

    if (this.accountInfo.reduxState === 'done' && this.accountInfo.loggedIn &&
        this.userInfo.reduxState === 'done' && this.userInfo.id !== undefined) {

      if (rereply.userId === this.userInfo.id) {
        this.network.removeRereply(this.accountInfo.accessToken, rereply)
        .subscribe(result => {
          if (result.result === true) {
            console.log(result.msg);
  
            const replyList = this.replyList.map(value => {
              return value._id === result.payload._id ?
                  Object.assign({}, result.payload) : value;
            });
            this.getUserInfosAndSet(replyList);
          } else {
            alert(conf.MSG_REREPLY_REMOVE_REREPLY_ERR);
          }
        });
      } else {
        console.error(`댓글 작성자 ${ rereply.userId }와 로그인 사용자 ${ this.userInfo.id }는 다른 사람이에요.`);
      }

    } else {
      console.error(`로그인 이후 이용해주세요.`);
    }
  }

  // 리플 업데이트
  updateReply(event: Reply) {
    // console.log(event);

    if (this.accountInfo.reduxState === 'done' && this.accountInfo.loggedIn &&
        this.userInfo.reduxState === 'done' && this.userInfo.id !== undefined) {

      if (event.userId === this.userInfo.id) {
        this.network.updateReply(this.accountInfo.accessToken, event)
        .subscribe(result => {
          if (result.result === true) {
            // console.log(result.msg);
            // console.log(result.payload);
            const replyList = this.replyList.map(value => {
              if (value.historyId === result.payload.historyId) {
                value = result.payload;
              }
              return value;
            });
            this.getUserInfosAndSet(replyList);
          } else {
            // TODO 실패.
            console.log(result.msg);
          }
        });
      } else {
        console.error(`댓글 작성자 ${ event.userId }와 로그인 사용자 ${ this.userInfo.id }는 다른 사람이에요.`);
      }

    } else {
      console.error(`로그인 이후 이용해주세요.`);
    }
  }

  // 리리플 업데이트
  updateRereply(event: Reply) {
    // console.log(event);

    if (this.accountInfo.reduxState === 'done' && this.accountInfo.loggedIn &&
        this.userInfo.reduxState === 'done' && this.userInfo.id !== undefined) {

      if (event.userId === this.userInfo.id) {
        this.network.updateRereply(this.accountInfo.accessToken, event)
        .subscribe(result => {
          if (result.result === true) {
            // TODO TEST
            // console.log(result.msg);
            // console.log(result.payload);
  
            const replyList = this.replyList.map(value => {
              if (value._id === result.payload._id) {
                value = Object.assign({}, result.payload);
              }
              return value;
            });
            this.getUserInfosAndSet(replyList);
          } else {
            // TODO
            console.log(result.msg);
          }
        });
      } else {
        console.error(`댓글 작성자 ${ event.userId }와 로그인 사용자 ${ this.userInfo.id }는 다른 사람이에요.`);
      }
    } else {
      console.error(`로그인 이후 이용해주세요.`);
    }
  }

  ngOnDestroy() {
    util.unSubscribe(this.documentSubc);
    util.unSubscribe(this.userInfoSubc);
    util.unSubscribe(this.accountSubc);
  }
}
