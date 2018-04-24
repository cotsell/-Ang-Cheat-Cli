import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxJs';
import { Store } from '@ngrx/store';

import * as Redux from '../../service/redux';
import { Network } from '../../service/Network';
import { Result, Category } from '../../service/Interface';
import { NewList } from '../../service/redux/categoryListReducer';
import { unSubscribe } from '../../service/utils';

@Component({
    selector: 'app-titlebar',
    templateUrl: './titlebar.component.html',
    styleUrls: ['./titlebar.component.scss']
})
export class TitlebarComponent implements OnInit, OnDestroy {
    private isSearchBarOpen = false;
    private categoryList: Category[] = [];

    private categorySubscription: Subscription;

    constructor(
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
        event.stopPropagation();
        this.isSearchBarOpen = !this.isSearchBarOpen;
    }

    ngOnDestroy() {
        unSubscribe(this.categorySubscription);
    }

}
