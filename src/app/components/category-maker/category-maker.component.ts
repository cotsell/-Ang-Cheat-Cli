import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Network } from '../../service/Network';
import * as conf from '../../service/SysConf';
import * as Redux from '../../service/redux';
import { Category, CategoryGrade2, CategoryGrade3 } from '../../service/Interface';

@Component({
    selector: 'app-category-maker',
    templateUrl: './category-maker.component.html',
    styleUrls: ['./category-maker.component.scss']
})
export class CategoryMakerComponent implements OnInit {
    @Output() cancel = new EventEmitter<any>();
    @ViewChild('cateSelect') select: ElementRef;
    private account: { logged: boolean, accessToken: string };
    private categoryList: Category[] = [];
    private category: Category;
    private tempId = 0;

    constructor(
        private network: Network,
        private router: Router,
        private store: Store<Redux.StoreInfo>
    ) { }

    ngOnInit() {
        this.getAllCategory();
        this.subscribeAccount();
    }

    private subscribeAccount() {
        this.store.select(Redux.getAccount)
            .subscribe(value => {

                // 사용자가 로그인 한 상태가 아니라면 킥!
                // 어차피 카테고리 변경을 위해서는 엑세스토큰이 필요하니까,
                // 보안 걱정은 안해도 될 듯 해요.
                if (value.loggedIn === false) {
                    this.closeModal(undefined);
                }

                this.account = {
                    logged: value.loggedIn,
                    accessToken:  value.accessToken
                };
            });
    }

    private getAllCategory() {
        this.network.getAllCategory()
            .subscribe(result => {
                if (result.result === true) {
                    // console.log(result.payload);
                    this.categoryList = result.payload;
                }
            });
    }

     // New 버튼을 누르면 호출. this.category를 새로운 값으로 초기화해요.
     private newCategory(event) {
        event.stopPropagation();
        this.category = {
            _id: 'new' + this.tempId,
            title: '',
            tag: '',
            grade: 1,
            subCategory: []
        };
    }

    // 플러스 버튼을 누르면 해당 위치에 새로운 subCategory를 추가해줘요.
    private addNewArticle(event, parentId) {
        event.stopPropagation();

        const newArticle = {
            _id: 'cate' + this.tempId++,
            title: '',
            tag: '',
            subCategory: []
        };

        if (this.category._id === parentId) {
            this.category.subCategory.push(newArticle);
        } else {
            if (this.category.subCategory !== undefined &&
                this.category.subCategory.length > 0) {
                this.category.subCategory.map(article => {
                    if (article._id === parentId) {
                        delete newArticle.subCategory;
                        article.subCategory.push(newArticle);
                    }
                });
            }
        }
    }

    // 카테고리를 선택하면 호출돼요.
    private selectedCategory(event) {
        event.stopPropagation();

        // console.log(event);

        // ---- 정리용도 함수 모음 -----------------------------------
        const lookingTag = (value: Category) => {
            return value.tag === event.target.value ? true : false;
        };
        // ---- 정리용도 함수 모음 끝 -------------------------------

        this.category = this.categoryList.find(lookingTag);
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

        // ---- 정리용도 함수 모음 끝 -----------------

        if (this.category._id === id) {
            if (type === 'title') {
                this.category.title = event.target.value;
            } else {
                this.category.tag = event.target.value;
            }
        } else {
            if (hasMoreSubCategory(this.category)) {
                this.category.subCategory.map(grade2);
            }
        }
        // console.log(this.category);
    }

    // 수정한 카테고리를 저장하는 함수.
    private saveCategory(event) {
        event.stopPropagation();

        if (this.category === undefined || this.category === null) {
            return;
        }

        if (this.category.title === undefined ||
            this.category.title === '' ||
            this.category.tag === undefined ||
            this.category.tag === '') {
                alert(conf.MSG_CATEGORY_MAKER_EMPTY_VALUE_ERR);
                return;
            }

        // ---- 정리용도 함수 모음 -----------------------------------
        const deleteGrade3Ids = (article: CategoryGrade3) => {
            delete article._id;
        };

        const deleteGrade2Ids = (article: CategoryGrade2) => {
            delete article._id;
            if (article.subCategory !== undefined && article.subCategory.length > 0) {
                article.subCategory.map(deleteGrade3Ids);
            }
        };
        // ---- 정리용도 함수 모음 끝 -------------------------------


        // 새로 만든 카테고리라면 Root id 삭제.
        if (this.category._id.indexOf('new') !== -1 ) {
            delete this.category._id;
        }

        if (this.category.subCategory !== undefined && this.category.subCategory.length > 0) {
            this.category.subCategory.map(deleteGrade2Ids);
        }

        this.network.setCategory(this.account.accessToken, this.category)
            .subscribe(value => {
                if (value.result === true) {

                    if (value.code === 0) {
                        // 새로운 입력.
                        console.log(`새로운 카테고리 등록.`);
                        this.categoryList.push(value.payload);
                    } else {
                        // 수정된 카테고리 업데이트.
                        console.log(`기존 카테고리 업데이트.`);
                        this.categoryList.map(article => {
                            if (article.tag === value.payload.tag) {
                                article = value.payload;
                            }
                        });
                    }
                    // console.log(this.categoryList);

                    this.select.nativeElement.children[0][0].selected = true;
                    this.category = undefined;
                    alert(conf.MSG_CATEGORY_MAKER_SAVE_OK);
                } else {
                    // TODO 새로운 입력이나, 업데이트 실패시 어떻게?
                }
            });
    }

    private deleteCategory(event) {
        if (event) {
            event.stopPropagation();
        }

        // 아무것도 선택되지 않았을 시
        if (this.category === undefined) {
            alert(conf.MSG_CATEGORY_MAKER_NOT_SELECT);
            return;
        }

        // 아직 서버에 만들지 않은 것 삭제시..

        this.network.removeCategory(this.account.accessToken, this.category._id)
            .subscribe(result => {
                if (result.result === true) {
                    console.log(result.msg);
                }
            });

    }

    private moveArticle(event, type: string, id: string) {
        if (event) { event.stopPropagation(); }

        // ---- 정리용도 함수 모음 -----------------------------------
        function hasMoreSubCategory(obj) {
            if (obj.subCategory !== undefined &&
                obj.subCategory.length > 0) {
                return true;
            } else {
                return false;
            }
        }

        function up(Array: any[], Index: number) {
            if (Index === 0) {
                return Array;
            } else {
                const temp = Array[Index - 1];
                Array[Index - 1] = Object.assign({}, Array[Index]);
                Array[Index] = Object.assign({}, temp);
                return Array;
            }
        }

        function down(Array: any[], Index: number) {
            if (Index === (Array.length - 1)) {
                return Array;
            } else {
                const temp = Array[Index];
                Array[Index] = Object.assign({}, Array[Index + 1]);
                Array[Index + 1] = Object.assign({}, temp);
                return Array;
            }
        }
        // ---- 정리용도 함수 모음 끝 -------------------------------

        if (hasMoreSubCategory(this.category)) {
            const grade2Index = this.category.subCategory.findIndex(grade2 => {
                return grade2._id === id ? true : false;
            });
            console.log(`grade2 Index: ${grade2Index}`);

            if (grade2Index !== -1 && type === 'up') {
                this.category.subCategory = up(this.category.subCategory, grade2Index);
            } else if (grade2Index !== -1 && type === 'down') {
                this.category.subCategory =
                    down(this.category.subCategory, grade2Index);
            } else if (grade2Index === -1) {

                // grade1에 없으니까, grade2로 이동 해서 검색..
                this.category.subCategory.forEach(grade2 => {
                    if (hasMoreSubCategory(grade2)) {
                        const grade3Index = grade2.subCategory.findIndex(grade3 => {
                            return grade3._id === id ? true : false;
                        });

                        if (grade3Index !== -1 && type === 'up') {
                            grade2.subCategory = up(grade2.subCategory, grade3Index);
                        } else if (grade3Index !== -1 && type === 'down') {
                            grade2.subCategory = down(grade2.subCategory, grade3Index);
                        }
                    }
                });
            }
        }

    console.log(this.category);
    }

    // 모달 닫기
    private closeModal(event) {
        if (event !== undefined) {
            event.stopPropagation();
        }

        this.cancel.emit(event);
    }

}