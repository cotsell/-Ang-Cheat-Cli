import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxJs';
import { Store } from '@ngrx/store';

import * as Utils from '../../service/utils';
import * as Redux from '../../service/redux';
import { Router } from '@angular/router';

@Component({
  selector: 'app-titlebar-menu',
  templateUrl: './titlebar-menu.component.html',
  styleUrls: ['./titlebar-menu.component.scss']
})
export class TitlebarMenuComponent implements OnInit {
  private isMenuHidden = true;
  private relatedId: string;
  private docuSubscription: Subscription;

  constructor(
    private store: Store<Redux.StoreInfo>,
    private route: Router) { }

  ngOnInit() {
    this.subscribeDocumentDetail();
  }

  private subscribeDocumentDetail() {
    this.store.select(Redux.getDocumentDetail)
      .subscribe(Result => {
        if (Result !== undefined && Result !== null) {
          if (Result.relatedDocuId !== undefined && Result.relatedDocuId !== null) {
            this.relatedId = Result.relatedDocuId;
          }
        }
      });
  }

  // 메뉴의 상세 내용의 화면 출력 여부를 변경해요.
  private changeMenuState(event) {
    event.stopPropagation();
    this.isMenuHidden = !this.isMenuHidden;
  }

  private writeDocument(event) {
    event.stopPropagation();
    if (this.relatedId === undefined ||
      this.relatedId === null || this.relatedId === '') {
        this.route.navigate(['/writeDocu']);
    } else {
      this.route.navigate(['/writeDocu', this.relatedId]);
    }
  }

}
