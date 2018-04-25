import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Network } from '../../service/Network';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxJs';
import * as marked from 'marked';
import * as prism from 'prismjs';

import * as Redux from '../../service/redux';
import Account from '../../service/Account';
import { UserInfo, DocumentInfo } from '../../service/Interface';
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
    private documentInfo: DocumentInfo;
    private userInfo: UserInfo;
    private accountSubscription: Subscription;
    private userInfoSubscription: Subscription;

    @ViewChild('target') preview_target: ElementRef;

    textForm: FormGroup = new FormGroup(
        {
            title: new FormControl(),
            text: new FormControl()
        }
    );

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private account: Account,
        private network: Network,
        private store: Store<Redux.StoreInfo>) { }

    ngOnInit() {
        this.subscribeAccountAndTryLogin();
        this.subscribeUserInfo();

        this.relatedId = this.route.snapshot.params['relatedId'];
        const documentId = this.route.snapshot.params['documentId'];

        // 문서 수정 모드, 연관아아디를 갖고 새 문서 작성 모드, 그냥 새 문서 작성 모드 구분.
        if (documentId !== undefined && documentId !== null) {
            // 문서 수정 모드.
            this.getDocumentFromServer(documentId);
        } else if (this.relatedId === undefined || this.relatedId === null) {
             console.log(this.relatedId);
             this.relatedId = '';
        }

        this.settingMakred();

    }

    // Account 리덕스를 구독하고, 미 로그인 상태일 시, 로컬 저장소를 살펴보고,
    // AccessToken이 있다면, 로그인을 시도해요.
    // 로그인 실패시에는 두번째 인자로 들어가는 콜백함수를 호출해요.
    private subscribeAccountAndTryLogin() {
        this.accountSubscription = this.account.loginWithAccessToken(
            result => {
                this.isLoggedIn = result.loggedIn;
                this.accessToken = result.accessToken;
                console.log(this.accessToken);
            },
            () => {
                // TODO 로그인 실패시 내용 코딩
                this.router.navigate(['/']);
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
        console.log('SEND NEW TEXT()');

        const NEW = 0;
        const EDIT = 1;
        let whatMode = EDIT;

        if (this.documentInfo === undefined || this.documentInfo === null) {
            // TODO 새글처리.
            whatMode = NEW;
            this.documentInfo = Object.assign({}, {
                userId: this.userInfo.id,
                relatedDocuId: this.relatedId
            });
        }

        this.documentInfo = Object.assign({}, this.documentInfo,
            { title: this.textForm.value['title'] },
            { text: this.textForm.value['text'] }
        );

        console.log(this.documentInfo);

        if (whatMode === NEW) {
            console.log('새로운 문서를 서버에 전송합니다.');
            this.network.newDocument(this.accessToken, this.documentInfo)
            .subscribe(value => {
                if (value.result === true) {
                    console.log(value.msg);
                    this.router.navigate(['/docuDetail', value.payload._id]);

                } else {
                    if (value.code === 1) {
                        console.log(value.msg);
                        // TODO 엑세스코드가 만료되었을 경우 해야 하는 처리.
                    } else {
                        // TODO 다른 경우의 에러 처리.
                    }
                }
            });
        } else {
            console.log('수정된 문서를 서버에 전송합니다.');
            this.network.modifyDocument(this.accessToken, this.documentInfo)
            .subscribe(value => {
                if (value.result === true) {
                    console.log(value.msg);
                    this.router.navigate(['/docuDetail', value.payload._id]);

                } else {
                    if (value.code === 1) {
                        console.log(value.msg);
                        // TODO 엑세스코드가 만료되었을 경우 해야 하는 처리.
                    } else {
                        // TODO 다른 경우의 에러 처리.
                    }
                }
            });
        }
    }

    // 에디터 화면에 작성중인 내용을 우측의 프리뷰 화면에 출력하기 위한
    private copyTextToPreview(event) {
        this.previewText = this.textForm.value.text;
        this.preview_target.nativeElement.innerHTML = marked(this.textForm.value.text);
        prism.highlightAllUnder(this.preview_target.nativeElement);
        // this.previewText = event.target.value;
    }

    private getDocumentFromServer(documentId: string) {
        this.network.getDocument(documentId)
        .subscribe(value => {
            if (value.result === true) {
                console.log(value.msg);
                this.documentInfo = value.payload;
                this.textForm.setValue(
                    {
                        title: value.payload.title,
                        text: value.payload.text
                    }
                );
            } else {
                if (value.code === 1) {
                    console.log(value.msg);
                    // TODO 엑세스토큰 오류일 경우 처리.
                } else {
                    // 다른 오류일 경우 처리.
                }
            }
        });
    }

    ngOnDestroy() {
        Utils.unSubscribe(this.accountSubscription);
        Utils.unSubscribe(this.userInfoSubscription);
    }

    // -----------------------------------------------------------------------
    // MarkDown Setting
    // -----------------------------------------------------------------------
    private settingMakred() {
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
}
