import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-reply-article',
  templateUrl: './reply-article.component.html',
  styleUrls: ['./reply-article.component.scss']
})
export class ReplyArticleComponent implements OnInit {
  @Input() isReReply = false;
  private isCommentShowed = false;

  constructor() { }

  ngOnInit() {
  }

  private changeCommentShowed(event) {
    event.stopPropagation();
    this.isCommentShowed = !this.isCommentShowed;
  }

}
