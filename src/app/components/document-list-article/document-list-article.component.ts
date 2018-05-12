import { Component, OnInit, Input } from '@angular/core';
import { DocumentInfo } from '../../service/Interface';
import * as utils from '../../service/utils';

@Component({
  selector: 'app-document-list-article',
  templateUrl: './document-list-article.component.html',
  styleUrls: ['./document-list-article.component.scss']
})
export class DocumentListArticleComponent implements OnInit {
  @Input() document: DocumentInfo;

  changeTimeString;

  constructor() {
    this.changeTimeString = utils.changeTimeString;
  }

  ngOnInit() {
  }

}
