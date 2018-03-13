import { Component, OnInit, Input } from '@angular/core';
import { DocumentInfo } from '../../service/Interface';

@Component({
  selector: 'app-document-list-article',
  templateUrl: './document-list-article.component.html',
  styleUrls: ['./document-list-article.component.scss']
})
export class DocumentListArticleComponent implements OnInit {
  @Input() document: DocumentInfo;

  constructor() { }

  ngOnInit() {
  }

}
