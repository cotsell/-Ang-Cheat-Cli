import { Component, OnInit, OnDestroy, OnChanges, Input, Output, EventEmitter, SimpleChanges, ViewChild, ElementRef  } from '@angular/core';
import { Store } from '@ngrx/store';
import * as Redux from '../../service/redux';
import { Subscription } from 'rxJs';
import { Category, DocumentInfo } from '../../service/Interface';
import { unSubscribe } from '../../service/utils';

interface IOutput {
  private: boolean;
  selectedLanguage: string;
}

@Component({
  selector: 'app-document-option-modal',
  templateUrl: './document-option-modal.component.html',
  styleUrls: ['./document-option-modal.component.scss']
})
export class DocumentOptionModalComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('select') select: ElementRef;
  @Input() on = false;
  @Input() document: DocumentInfo;
  @Output() exit = new EventEmitter<boolean>();
  @Output() ok = new EventEmitter<IOutput>();

  isPrivateMode = false;
  selectedLanguage = '-1';
  categoryList: Category[];
  // library;

  categorySubs: Subscription;

  constructor(private store: Store<Redux.StoreInfo>) { }

  ngOnInit() {
    if (this.document !== undefined) {
      this.isPrivateMode = this.document.private;
      this.selectedLanguage = this.document.tagList[0];
    }
    this.subscribeCategory();
  }

  changePrivateMode(event) {
    if (event) { event.stopPropagation(); }

    this.isPrivateMode = !this.isPrivateMode;
  }

  // 카테고리 구독.
  subscribeCategory() {
    this.categorySubs = this.store.select(Redux.getCategoryList)
      .subscribe(result => {
        this.categoryList = result;
      });
  }

  // 해당 옵션과 함께 문서 저장을 요청해요.
  save(event) {
    if (event) { event.stopPropagation(); }

    if (this.selectedLanguage === undefined ||
        this.selectedLanguage === '' ||
        this.selectedLanguage === '-1') {
        alert('언어를 선택해 주세요.');
    } else {
      this.ok.emit({
        private: this.isPrivateMode,
        selectedLanguage: this.selectedLanguage });
    }

  }

  changeSelectedLanguage(event) {
    if (event) { event.stopPropagation(); }
    
    this.selectedLanguage = event.target.value;
  }

  // -----------------------------------------------------------
  // ---- 모달 운영에 필요한 함수.
  // -----------------------------------------------------------
  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes);
    if (this.on) {
      this.ngOnInit();
    } else {
      this.pause();
    }
  }

  // 모달이 종료(멈춤) 상태로 돌입할 때 해야 할 일들...
  pause() {
    this.categoryList = [];
    this.selectedLanguage = undefined;
    unSubscribe(this.categorySubs);
  }

  // 모달을 종료(멈춤)하는 함수.
  closeModal(event) {
    if (event) { event.stopPropagation(); }

    this.exit.emit(true);
  }

  ngOnDestroy() {
    unSubscribe(this.categorySubs);
  }

}
