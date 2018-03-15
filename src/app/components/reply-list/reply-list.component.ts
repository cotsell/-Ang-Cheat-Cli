import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reply-list',
  templateUrl: './reply-list.component.html',
  styleUrls: ['./reply-list.component.scss']
})
export class ReplyListComponent implements OnInit {
  private isReplyEditMode = false;

  constructor() { }

  ngOnInit() {
  }

  private changeReplyEditMode(event) {
    event.stopPropagation();
    this.isReplyEditMode = !this.isReplyEditMode;
  }

}
