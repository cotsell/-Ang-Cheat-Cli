/*
    categoryList: 카테고리리스트, 리덕스로부터 정보를 가져와요.
    category: 유저가 메뉴에서 선택한 카테고리의 자세한 정보를 저장하고, 화면에 표시합니다.
    selectedCategory: 유저가 메뉴에서 선택한 카테고리(언어)의 tag값을 갖어요.
        이 tag값은 화면에 뿌려 줄 카테고리가 참고하는 값이에요.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxJs';
import { Store } from '@ngrx/store';

import { unSubscribe } from '../../service/utils';
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
    private isMenuHidden = true;
    private isCategoryModalOpen = false;
    private relatedId: string;
    private categoryList: Category[] = [];
    private category: Category;
    private selectedCategory: string;

    private docSubscription: Subscription;
    private cateSubscription: Subscription;

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
    private subscribeDocumentDetail() {
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
    private subscribeCategoryList() {
        let selectedCategory = '';
        this.cateSubscription = this.store.select(Redux.getCategoryList)
        .subscribe(value => {
            selectedCategory = this.selectedCategory;
            this.categoryList = value;

            // 선택된 카테고리가 있다면..
            if (
                this.selectedCategory !== undefined &&
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

    private selectedLanguage(event) {
        event.stopPropagation();
        const store = this.store;
        const selectedCategory = event.target.value;
        this.selectedCategory = event.target.value;

        // 선택된 카테고리의 내부 정보가 서버로부터 받아졌는지 확인,
        // 안 받아졌다면, 서버로 요청.
        this.category = this.categoryList.find(isRight);
        if (this.category.subCategory === undefined ||
            this.category.subCategory === null ||
            this.category.subCategory.length < 1) {

            this.network.getCategory(this.category._id)
            .subscribe(checkCategoryResult);
        }

        // ---- 정리용도 함수들 ----
        function isRight(value: Category) {
            return value.tag === selectedCategory ? true : false;
        }

        function checkCategoryResult(value: Result) {
            store.dispatch(new Modify(value.payload));
        }
    }

    private closeHideMenu(event) {
        event.stopPropagation();
        this.isMenuHidden = true;
    }

    private stopBubbling(event) {
        event.stopPropagation();
    }

    // 카테고리 모달의 열림, 닫힘 상태를 변경하고 있어요.
    private changeCategoryModalState(event) {
        if (event !== undefined) {
            event.stopPropagation();
        }

        this.isCategoryModalOpen = !this.isCategoryModalOpen;
        this.isMenuHidden = true;
    }

    ngOnDestroy() {
        unSubscribe(this.docSubscription);
        unSubscribe(this.cateSubscription);
    }
}
