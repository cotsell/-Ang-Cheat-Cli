import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Subscription } from 'rxJs';
import { Store } from '@ngrx/store';

import * as Redux from '../../service/redux';
import { Network } from '../../service/Network';
import { Result, Category } from '../../service/Interface';
import { NewList } from '../../service/redux/categoryListReducer';
import { unSubscribe } from '../../service/utils';
import { VALUE_ALL_CATEGORY } from '../../service/SysConf';

@Component({
    selector: 'app-titlebar',
    templateUrl: './titlebar.component.html',
    styleUrls: ['./titlebar.component.scss']
})
export class TitlebarComponent implements OnInit, OnDestroy {
    private readonly ALL_CATEGORY = VALUE_ALL_CATEGORY;

    @ViewChild('searchBox') searchBox: ElementRef;
    private isSearchBarOpen = false;
    private selectedLanguage = VALUE_ALL_CATEGORY;
    private categoryList: Category[] = [];

    private categorySubscription: Subscription;

    constructor(
        private router: Router,
        private store: Store<Redux.StoreInfo>,
        private network: Network) { }

    ngOnInit() {
        const store = this.store;

        this.categorySubscription = this.store.select(Redux.getCategoryList)
        .subscribe(value => {
            if (value.length < 1) {
                this.network.getAllGradeOneCategorys()
                .subscribe(categoryResult);
            } else {
                this.categoryList = value;
            }
        });

        // ---- 정리용도 함수 모음 ----
        function categoryResult (value: Result) {
            if (value.result) {
                console.log(value.msg);
                store.dispatch(new NewList(value.payload));
            } else {
                console.log(value.msg);
                // TODO 카테고리 가져오기 실패하면 어쩌지?
            }
        }
    }

    private changeSearchBarState(event) {
        if (event) { event.stopPropagation(); }

        this.searchBox.nativeElement.value = '';
        this.isSearchBarOpen = !this.isSearchBarOpen;
    }

    private changedLanguage(event) {
        event.stopPropagation();
        if (event.target.value !== undefined && event.target.value !== '0') {
            // TODO 언어가 바뀌면 할 일.
            this.selectedLanguage = event.target.value;
            // console.log(`선택된 언어는 ${this.selectedLanguage} 에요.`);
        }
    }

    private searchDocument(event) {
        event.stopPropagation();
        const subject = this.searchBox.nativeElement.value;
        // console.log(subject);
        this.isSearchBarOpen = false;

        // 검색어가 없으면 안되니까 필터링.
        if (subject !== undefined && subject !== '') {
            const extras: NavigationExtras = {
                    queryParams:
                        {
                            lang: this.selectedLanguage,
                            type: 0,
                            subj: subject
                        }
                };
            this.router.navigate(['/docuList'], extras);
        }
    }

    ngOnDestroy() {
        unSubscribe(this.categorySubscription);
    }

}
