import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-reply-article',
  templateUrl: './reply-article.component.html',
  styleUrls: ['./reply-article.component.scss']
})
export class ReplyArticleComponent implements OnInit {
  @Input() isReReply = false;
  private isCommentShowed = false;

  private commentForm = new FormGroup({
    comment: new FormControl()
  });

  constructor() { }

  ngOnInit() {
  }

  private changeCommentShowed(event) {
    event.stopPropagation();
    this.isCommentShowed = !this.isCommentShowed;
  }

  private sendReply(event) {
    event.stopPropagation();
    
  }

}
