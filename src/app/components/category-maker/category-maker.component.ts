import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Category, CategoryGrade2 } from '../../service/Interface';
import { Network } from '../../service/Network';

@Component({
    selector: 'app-category-maker',
    templateUrl: './category-maker.component.html',
    styleUrls: ['./category-maker.component.scss']
})
export class CategoryMakerComponent implements OnInit {
    @Output() cancel = new EventEmitter<any>();
    private categoryList: Category[];
    private category: Category;

    constructor(
        private network: Network
    ) { }

    ngOnInit() {
        this.getAllCategory();
    }

    private getAllCategory() {
        this.network.getAllCategory()
            .subscribe(result => {
                if (result.result === true) {
                    console.log(result.payload);
                    this.categoryList = result.payload;
                }
            });
    }

    private selectedCategory(event) {
        event.stopPropagation();

        // ---- 정리용도 함수들 ----
        const lookingTag = (value: Category) => {
            return value.tag === event.target.value ? true : false;
        };
        // --------------------------------

        this.category = this.categoryList.find(lookingTag);
    }

    private newCategory(event) {
        event.stopPropagation();
        this.category = { _id: 'root', title: '제목', tag: '태그' };
    }

    // 카테고리 수정 함수.
    private updateCategory(event, id, type) {
        event.stopPropagation();

        // ---- 정리용도 함수 모음 ----
        // 해당 오브젝트가 subCategory를 갖고 있는지 체크.
        const hasMoreSubCategory = (obj: any) => {
            if (
                obj.subCategory !== undefined &&          obj.subCategory.length > 0) {
                    return true;
            } else {
                return false;
            }
        };

        const grade2 = (gr2Value: CategoryGrade2) => {
            // grade2의 객체도 grade3를 갖고 있는지 확인하고, 있으면 grade3부터 _id 검색, 같은게 있으면 변경.
            if (hasMoreSubCategory(gr2Value)) {
               gr2Value.subCategory.map(result => {
                    if (result._id === id) {
                        if (type === 'title') {
                            result.title = event.target.value;
                        } else {
                            result.tag = event.target.value;
                        }
                    }
                });
            }

            // 2Grade _id 검사
            if (gr2Value._id === id) {
                if (type === 'title') {
                    gr2Value.title = event.target.value;
                } else {
                    gr2Value.tag = event.target.value;
                }
            }
        };

        // ------------------------------------

        if (this.category._id === id) {
            this.category.title = event.target.value;
        } else {
            if (hasMoreSubCategory(this.category)) {
                this.category.subCategory.map(grade2);
            }
        }
        console.log(this.category);
    }

    // 모달 닫기
    private closeModal(event) {
        event.stopPropagation();
        this.cancel.emit(event);
    }

}
