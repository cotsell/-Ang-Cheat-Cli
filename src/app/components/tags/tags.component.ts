import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {
  @Input() tagList = [];
  @Output() output;

  constructor() { }

  ngOnInit() {
  }

  private insertNewTag(event) {
    event.stopPropagation();
    if (event.key === 'Enter') {
      this.tagList.push({title: event.target.value});
      event.target.value = '';
    }
  }

}
