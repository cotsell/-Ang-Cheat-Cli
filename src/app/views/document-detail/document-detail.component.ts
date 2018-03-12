import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxJs';

import { UserInfo, DocumentInfo } from '../../service/Interface';
import { Network } from '../../service/Network';
import * as dumy from '../../service/Interface'; // 더미 데이터에요. 테스트 하고 나중에 지워주세요.
import * as Utils from '../../service/utils';
import { Store } from '@ngrx/store';
import * as Redux from '../../service/redux';
import Account from '../../service/Account';
import { NewDocumentDetail, ModifyDocumentDetail, RemoveDocumentDetail } from '../../service/redux/DocumentDetailReducer';

@Component({
    selector: 'app-document-detail',
    templateUrl: './document-detail.component.html',
    styleUrls: ['./document-detail.component.scss']
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
    private isEditMode = false;
    private isLoggedIn = false;
    private accessToken: string;
    private documentId: string;
    private userInfo: UserInfo;
    private documentInfo: DocumentInfo;

    private accountSubscription: Subscription;
    private userInfoSubscription: Subscription;
    private documentSubscription: Subscription;


    // 문서 저장 폼 설정
    documentForm: FormGroup = new FormGroup({
        title: new FormControl(),
        text: new FormControl()
    });

    constructor(
        private route: ActivatedRoute,
        private network: Network,
        private store: Store<Redux.StoreInfo>,
        private account: Account) {
        this.documentId = route.snapshot.params['id'];
    }

    ngOnInit() {
        this.subscribeAccountAndTryLoginWithAccessToken();
        this.subscribeUserInfo();
        this.subscribeDocumentDetail();
        this.getDocumentFromServer();
    }

    // 문서를 서버에 저장하는 함수에요.
    private saveDocumentToServer(event) {
        console.log(event);

        console.log(this.documentForm.value);
        const title = this.documentForm.value['title'];
        const text = this.documentForm.value['text'];
        const editedDoc = Object.assign({}, this.documentInfo, { title: title, text: text });
        console.log(JSON.stringify(editedDoc));

        // TODO 서버의 응답 내용이 달라질 여지가 있습니다.
        this.network.modifyDocument(this.accessToken, editedDoc)
            .subscribe(obs => {
                if (obs.result === true) {
                    this.changeEditMode();
                    // TODO 수정 후 내용을 디스패치 해야 하는데, 아직은 대충 해놓음.
                    this.store.dispatch(new ModifyDocumentDetail(editedDoc));
                } else {
                    // TODO 문서 저장 실패시 대응 코딩 필요.
                    this.store.dispatch(new ModifyDocumentDetail(this.documentInfo));
                }
            });
    }

    // 문서를 수정 중에 취소버튼을 누르면..
    private cancelSavingDocument(event) {
        event.stopPropagation();
        this.changeEditMode();
    }

    // 서버에 문서 삭제 요청을 하는 함수에요.
    private deleteDocument(event) {
        event.stopPropagation();
        // TODO 글 삭제 기능 추가.
        console.log('삭제 버튼이 눌렸으나, 기능은 작성되지 않았어요.');

    }

    // 서버로부터 문서를 가져옵니다.
    private getDocumentFromServer() {
        // TODO 서버의 응답 내용이 달라질 여지가 있습니다.
        this.network.getDocument(this.documentId)
            .subscribe(doc => {
                if (doc.result === true) {
                    this.store.dispatch(new NewDocumentDetail(Object.assign({}, doc).payload));
                } else {
                    // TODO 문서 전송 실패 대응 코딩 필요.
                    console.log('문서를 받아오는데 실패 했어요.');
                }
            });
    }

    private changeEditMode(event?) {
        if (event !== undefined && event !== null) {
            event.stopPropagation();
        }
        this.isEditMode = !this.isEditMode;

        // isEditMode가 true로 변한 상태라면, document의 form에 데이터를 넣어주죠.
        if (this.isEditMode === true) {
            this.documentForm.setValue(
                {
                    title: this.documentInfo.title,
                    text: this.documentInfo.text
                });
        }
    }

    private clickEvent(event) {
        event.stopPropagation();
        // TODO 미완성.
    }

    // account 리덕스를 구독하고,
    // 내친김에 로컬 저장소에 AccessToken과 userId가 있다면, 로그인을 시도합니다.
    private subscribeAccountAndTryLoginWithAccessToken() {
        this.accountSubscription = this.account.loginWithAccessToken(result => {
            this.isLoggedIn = result.loggedIn;
            this.accessToken = result.accessToken;
        });
    }

    // UserInfo 리덕스를 구독해요.
    private subscribeUserInfo() {
        this.store.select(Redux.getUserInfo)
            .subscribe(userInfo => {
                this.userInfo = userInfo;
            });
    }

    // DocumentDetail 리덕스를 구독해요.
    private subscribeDocumentDetail() {
        this.store.select(Redux.getDocumentDetail)
            .subscribe(doc => {
                this.documentInfo = Object.assign({}, doc);
            });
    }

    ngOnDestroy() {
        Utils.unSubscribe(this.accountSubscription);
        Utils.unSubscribe(this.userInfoSubscription);
        Utils.unSubscribe(this.documentSubscription);
        this.store.dispatch(new RemoveDocumentDetail());
    }

}
