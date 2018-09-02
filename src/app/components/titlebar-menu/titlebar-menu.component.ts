/*
    categoryList: 카테고리리스트, 리덕스로부터 정보를 가져와요.
    category: 유저가 메뉴에서 선택한 카테고리의 자세한 정보를 저장하고, 화면에 표시합니다.
    selectedCategory: 유저가 메뉴에서 선택한 카테고리(언어)의 tag값을 갖어요.
        이 tag값은 화면에 뿌려 줄 카테고리가 참고하는 값이에요.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxJs';
import { Store } from '@ngrx/store';

import { unSubscribe, bodyScroll } from '../../service/utils';
import * as Redux from '../../service/redux';
import { Router } from '@angular/router';
import { Category, Result } from '../../service/Interface';
import { Network } from '../../service/Network';
import { Modify } from '../../service/redux/categoryListReducer';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-titlebar-menu',
    templateUrl: './titlebar-menu.component.html',
    styleUrls: ['./titlebar-menu.component.scss']
})
export class TitlebarMenuComponent implements OnInit, OnDestroy {
  isMenuHidden = true;
  isCategoryModalOpen = false;
  relatedId: string;
  categoryList: Category[] = [];
  category: Category;
  selectedCategory: string;

  docSubscription: Subscription;
  cateSubscription: Subscription;

  constructor(
    private store: Store<Redux.StoreInfo>,
    private network: Network,
    private route: Router) { }

  ngOnInit() {
    this.subscribeDocumentDetail();
    this.subscribeCategoryList();
  }

  // 연관문서ID를 얻기 위해서 리덕스의 DocumentDetail을 구독합니다.
  // TODO 연관문서ID는 기능 미작동 중 이에요.
  subscribeDocumentDetail() {
    this.docSubscription = this.store.select(Redux.getDocumentDetail)
    .subscribe(result => {
      if (result !== undefined && result !== null) {
        if (result.relatedDocuId !== undefined && result.relatedDocuId !== null) {
          this.relatedId = result.relatedDocuId;
        }
      }
    });
  }

  // 카테고리 리스트를 구독합니다.
  subscribeCategoryList() {
    let selectedCategory = '';
    this.cateSubscription = this.store.select(Redux.getCategoryList)
      .subscribe(value => {
        selectedCategory = this.selectedCategory;
        this.categoryList = value;

        // 선택된 카테고리가 있다면..
        if (this.selectedCategory !== undefined &&
            this.selectedCategory !== null &&
            this.selectedCategory !== '') {
          this.category = value.find(findingSelected);
        }
      });

    // ---- 정리용도 함수들 ----
    function findingSelected(value: Category) {
        return value.tag === selectedCategory ? true : false;
    }
  }

  // 메뉴의 상세 내용의 화면 출력 여부를 변경해요.
  changeMenuState(event) {
    if (event) { event.stopPropagation(); }

    this.isMenuHidden = !this.isMenuHidden;
    bodyScroll(this.isMenuHidden);
  }

  writeDocument(event) {
    if (event) { event.stopPropagation(); }

    this.changeMenuState(undefined);
    if (this.relatedId === undefined ||
        this.relatedId === null || this.relatedId === '') {
      this.route.navigate(['/writeDocu']);
    } else {
      this.route.navigate(['/writeDocu', this.relatedId]);
    }
  }

  // select에서 언어를 선택하면, 리덕스로부터 구독한 정보를 바탕으로,
  // 카테고리의 서브 카테고리들을 받은적이 있는지 확인하고, 
  // 받은적이 없는 카테고리는 서버로 서브 카테고리를 요청해서,
  // 리덕스의 카테고리에 해당 카테고리의 서브 카테고리를 갱신해줘요.
  selectedLanguage(event) {
    if (event) { event.stopPropagation(); }

    const store = this.store;
    const selectedCategory = event.target.value;
    this.selectedCategory = event.target.value;

    // 선택된 카테고리의 내부 정보가 서버로부터 받아졌는지 확인,
    // 안 받아졌다면, 서버로 요청.

    // TODO 아래 코드에 문제가 있어서, 일단 대체용 코드사용.
    // 카테고리 매니져로 카테고리 구조 수정 후에 메뉴의 카테고리를 변경하면,
    // 변경된 내용이 적용되지 않는 문제가 있음. 일단은 무조껀 새로 가져와서 갱신하게 
    // 해둠.
    // this.category = this.categoryList.find(isRight);
    // if (this.category !== undefined) {
    //   if (this.category.subCategory === undefined ||
    //       this.category.subCategory === null ||
    //       this.category.subCategory.length < 1) {

    //     this.network.getCategory(this.category._id)
    //     .subscribe(checkCategoryResult);
    //   }
    // }

    // 바로 위 내용의 대체코드임. 해결되면 삭제 요망.
    this.category = this.categoryList.find(isRight);
    this.network.getCategory(this.category.historyId)
    .subscribe(checkCategoryResult);

    // ---- 정리용도 함수들 ----
    function isRight(value: Category) {
      return value.tag === selectedCategory ? true : false;
    }

    function checkCategoryResult(value: Result) {
      console.log(`In category networking`);
      console.log(value);
      store.dispatch(new Modify(value.payload));
    }
  }

  stopBubbling(event) {
    if (event) { event.stopPropagation(); }
  }

  // 카테고리 모달의 열림, 닫힘 상태를 변경하고 있어요.
  changeCategoryModalState(event) {
    if (event) { event.stopPropagation(); }

    this.isMenuHidden = true;
    this.isCategoryModalOpen = !this.isCategoryModalOpen;
    bodyScroll(!this.isCategoryModalOpen);
  }

  ngOnDestroy() {
    unSubscribe(this.docSubscription);
    unSubscribe(this.cateSubscription);
  }
}
