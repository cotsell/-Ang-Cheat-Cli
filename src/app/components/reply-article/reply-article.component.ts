import { Component, OnInit, OnDestroy, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Reply } from '../../service/Interface';
import { Store } from '@ngrx/store';
import * as Redux from '../../service/redux';
import { Subscription } from 'rxJs';
import { jwtDecode, unSubscribe } from '../../service/utils';
import * as util from '../../service/utils';

@Component({
    selector: 'app-reply-article',
    templateUrl: './reply-article.component.html',
    styleUrls: ['./reply-article.component.scss']
})
export class ReplyArticleComponent implements OnInit, OnDestroy {
    @ViewChild('textarea') textarea: ElementRef;
    @ViewChild('editingTextarea') editingText: ElementRef;
    @Input() isReReply = false;
    @Input() reply: Reply;
    @Output() makeRereply = new EventEmitter<Reply>();
    @Output() modifyReply = new EventEmitter<Reply>();
    @Output() modifyRereply = new EventEmitter<Reply>();
    @Output() deleteReply = new EventEmitter<string>();
    @Output() deleteRereply = new EventEmitter<Reply>();
    private account = { logged: false, accessToken: undefined };
    private isCommentShowed = false;
    private isTextEditMode = false;
    private isAbleToShowEditButtons = false; // 수정, 삭제 버튼 여부
    private isAbleToShowReplyButton = false;
    private accountSubsc: Subscription;

    // 함수들..
    private changeTimeString; // 시간 출력 모드 변환 함수.

    constructor(private store: Store<Redux.StoreInfo>) {
        this.changeTimeString = util.changeTimeString;
    }

    ngOnInit() {
        this.subscribeAccount();
    }

    // 사용자가 로그인 상태인지 구독.
    // 여기서 기능 버튼 노출 여부도 결정 돼요.
    private subscribeAccount() {
        this.accountSubsc = this.store.select(Redux.getAccount)
            .subscribe(value => {
                if (value.loggedIn === true) {
                    this.account.logged = true;
                    this.account.accessToken = value.accessToken;

                    // 댓글에 수정, 댓글, 삭제 버튼을 노출할 것인가를 결정.
                    const userId = jwtDecode(this.account.accessToken)['userId'];

                    // 삭제된 리플이 아니라면 댓글은 쓸 수 있게 해줄께.
                    if (this.reply.deletedReply === false) {
                        this.isAbleToShowReplyButton = true;
                    }

                    // 근데 리플 작성자가 너라면, 수정이랑 삭제도 할 수 있게 해줄께.
                    if (userId === this.reply.userId &&
                        this.reply.deletedReply === false) {
                        this.isAbleToShowEditButtons = true;
                    } else {
                        this.isAbleToShowEditButtons = false;
                    }

                } else {
                    this.account.logged = false;
                    this.account.accessToken = undefined;
                    this.isAbleToShowEditButtons = false;
                    this.isAbleToShowReplyButton = false;
                }
            });
    }

    private changeCommentShowed(event) {
        if (event) { event.stopPropagation(); }

        this.isCommentShowed = !this.isCommentShowed;
    }

    // 댓글 작성 후 보내기
    private sendRereply(event) {
        if (event) { event.stopPropagation(); }

        const reply: Reply = {
            parentId: this.reply._id,
            parentUserId: this.reply.userId,
            text: this.textarea.nativeElement.value,
            userId: ''
        };

        this.textarea.nativeElement.value = '';
        this.makeRereply.emit(reply);
    }

    // 리플을 삭제해요.
    private removeReply(event) {
        if (event) { event.stopPropagation(); }

        this.deleteReply.emit(this.reply._id);
    }

    // 리리플을 삭제해요.
    private removeRereply(event) {
        if (event) { event.stopPropagation(); }

        this.deleteRereply.emit(this.reply);
    }

    // 댓글 작성 중 취소 하면 호출
    private resetWriting(event) {
        if (event) { event.stopPropagation(); }

        this.textarea.nativeElement.value = '';
        this.changeCommentShowed(undefined);
    }

    // 댓글 수정버튼을 누르면 수정 모드로 변환.
    private changeTextEditMode(event) {
        if (event) { event.stopPropagation(); }

        this.isTextEditMode = !this.isTextEditMode;
    }

    private updateReply(evnet) {
        if (event) { event.stopPropagation(); }

        const reply: Reply = Object.assign({},
            {
                ...this.reply,
                text: this.editingText.nativeElement.value,
            });

        this.changeTextEditMode(undefined);
        this.modifyReply.emit(reply);
    }

    private updateRereply(event) {
        if (event) { event.stopPropagation(); }

        const reply: Reply = Object.assign({},
            {
                ...this.reply,
                text: this.editingText.nativeElement.value
            }
        );

        this.changeTextEditMode(undefined);
        this.modifyRereply.emit(reply);
    }

    ngOnDestroy() {
        unSubscribe(this.accountSubsc);
    }

}
