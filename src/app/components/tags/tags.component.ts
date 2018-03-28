import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Tag } from '../../service/Interface';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {
  @Input() tagList = [];
  @Output() output: EventEmitter<Tag> = new EventEmitter();
  @Output() remove: EventEmitter<Tag> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  private insertNewTag(event) {
    event.stopPropagation();
    if (event.key === 'Enter') {
      // this.tagList.push({title: event.target.value});
      const value = event.target.value;
      if (value !== '') {
        this.output.emit({ title: value });
        event.target.value = '';
      }
    }
  }

  private removeTag(event) {
    event.stopPropagation();
    const title = event.target.innerText;
    console.log(event.target.innerText);
    this.remove.emit({ title: title });
  }

}
