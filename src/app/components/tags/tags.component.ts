import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Tag } from '../../service/Interface';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {
  // *ngFor을 쓰기 위해서는 객체 형태가 좋기 때문에, 변경해주도록 해요.
  @Input() set tagList(value: string[]) {
    if (value !== undefined) {
      this._tagList = value.map(inner => {
      return new Tag(inner);
      });
    }
    // console.log(this._tagList);
  }
  get tagList() {
    return this._tagList.map(value => {
        return value.title;
    });
  }

  @Output() insert: EventEmitter<string> = new EventEmitter();
  @Output() remove: EventEmitter<string> = new EventEmitter();

  private _tagList: Tag[] = [];

  constructor() { }

  ngOnInit() {
  }

  private insertNewTag(event) {
    if (event) { event.stopPropagation(); }

    if (event.key === 'Enter') {
      const value = event.target.value;
      const rule = /[^a-zA-Z0-9]+/g;
      const result: any = value.match(rule);
      
      if (value !== '' && result === null) {
        this.insert.emit(value);
        event.target.value = '';
      } else {
        alert('태그에는 빈공간과 특수문자는 사용하지 말아주세요.');
      }
    }
  }

  private removeTag(event) {
    if (event) { event.stopPropagation(); }

    const title = event.target.innerText;
    // console.log(event.target.innerText);
    this.remove.emit(title);
  }
}
