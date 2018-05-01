import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Reply } from '../../service/Interface';

@Component({
    selector: 'app-reply-article',
    templateUrl: './reply-article.component.html',
    styleUrls: ['./reply-article.component.scss']
})
export class ReplyArticleComponent implements OnInit {
    @ViewChild('textarea') textarea: ElementRef;
    @Input() isReReply = false;
    @Input() reply: Reply;
    @Output() makeRereply = new EventEmitter<Reply>();
    @Output() deleteReply = new EventEmitter<string>();
    @Output() deleteRereply = new EventEmitter<Reply>();
    private isCommentShowed = false;

    constructor() { }

    ngOnInit() {
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
            text: this.reply.userId + '\n' + this.textarea.nativeElement.value,
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

}
