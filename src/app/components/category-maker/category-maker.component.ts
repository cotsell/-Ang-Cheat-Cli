import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Network } from '../../service/Network';
import * as conf from '../../service/SysConf';
import * as Redux from '../../service/redux';
import { Category, CategoryGrade2, CategoryGrade3, Account as iAccount } from '../../service/Interface';

@Component({
  selector: 'app-category-maker',
  templateUrl: './category-maker.component.html',
  styleUrls: ['./category-maker.component.scss']
})
export class CategoryMakerComponent implements OnInit {
  @Output() cancel = new EventEmitter<any>();
  @ViewChild('cateSelect') select: ElementRef;
  accountInfo: iAccount;
  categoryList: Category[] = [];
  category: Category;
  tempId = 0;

  constructor(
    private network: Network,
    private router: Router,
    private store: Store<Redux.StoreInfo>
  ) { }

  ngOnInit() {
    this.getAllCategory();
    this.subscribeAccount();
  }

  subscribeAccount() {
    this.store.select(Redux.getAccount)
    .subscribe(value => {

      // 사용자가 로그인 한 상태가 아니라면 킥!
      // 어차피 카테고리 변경을 위해서는 엑세스토큰이 필요하니까,
      // 보안 걱정은 안해도 될 듯 해요.
      if (value.reduxState === 'done' && value.loggedIn === false) {
        this.closeModal(undefined);
      }

      if (value.reduxState === 'done' && value.loggedIn) {
        this.accountInfo = value;
      }
    });
  }

  getAllCategory() {
    this.network.getAllCategory()
    .subscribe(result => {
      if (result.result === true) {
        // console.log(result.payload);
        this.categoryList = result.payload;
      }
    });
  }

  // New 버튼을 누르면 호출. this.category를 새로운 값으로 초기화해요.
  newCategory(event) {
    if (event) { event.stopPropagation(); }

    this.select.nativeElement.children[0][0].selected = true;

    this.category = {
      _id: 'new' + this.tempId,
      title: '',
      tag: '',
      grade: 1,
      subCategory: []
    };
  }

  // 플러스 버튼을 누르면 해당 위치에 새로운 subCategory를 추가해줘요.
  addNewArticle(event, parentId) {
    if (event) { event.stopPropagation(); }

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
  selectedCategory(event) {
    if (event) { event.stopPropagation(); }

    // console.log(event);

    // ---- 정리용도 함수 모음 -----------------------------------
    const lookingTag = (value: Category) => {
      return value.tag === event.target.value ? true : false;
    };
    // ---- 정리용도 함수 모음 끝 -------------------------------

    this.category = this.categoryList.find(lookingTag);
  }

  // 카테고리 수정 함수.
  // title과 tag의 내용을 바꾸는데, 각 input element들과 데이터 구조를
  // 1:1 매칭하기 어렵기 때문에, 매 입력때마다 element의 id와 데이터 구조의 id를
  // 비교해서 변경할 데이터를 찾고 값을 변경해요.
  updateCategory(event, id, type) {
    if (event) { event.stopPropagation(); }

    // ---- 정리용도 함수 모음 ----
    // 해당 오브젝트가 subCategory를 갖고 있는지 체크.
    const hasMoreSubCategory = (obj: any) => {
      if (obj.subCategory !== undefined && obj.subCategory.length > 0) {
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
  saveCategory(event) {
    if (event) { event.stopPropagation(); }

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

    if (this.category.subCategory !== undefined &&
        this.category.subCategory.length > 0) {
      this.category.subCategory.map(deleteGrade2Ids);
    }

    this.network.setCategory(this.accountInfo.accessToken, this.category)
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

  // 카테고리 삭제해요.
  deleteCategory(event) {
    if (event) { event.stopPropagation(); }

    if (this.category === undefined) {

      // 아무것도 선택되지 않았을 시
      alert(conf.MSG_CATEGORY_MAKER_NOT_SELECT);

    } else if (this.category._id.indexOf('new') === 0) {

      // 아직 서버에 만들지 않은 것 삭제시..
      console.log(`서버에 저장하지 않은 카테고리여서, 메모리에서만 삭제할께요.`);
      this.select.nativeElement.children[0][0].selected = true;
      this.category = undefined;

    } else {

      this.network.removeCategory(this.accountInfo.accessToken, this.category._id)
      .subscribe(result => {
        if (result.result === true) {
          console.log(result.msg);
          this.select.nativeElement.children[0][0].selected = true;
          this.category = undefined;
        }
      });

    }
  }

  // 카테고리 메이커 내의 항목을 이동시켜줘요. 위 아래 위 위 아래.
  moveArticle(event, type: string, id: string) {
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

    const dummy = Object.assign({}, this.category);

    if (hasMoreSubCategory(dummy)) {
      const grade2Index = dummy.subCategory.findIndex(grade2 => {
        return grade2._id === id ? true : false;
      });
      console.log(`grade2 Index: ${grade2Index}`);

      if (grade2Index !== -1 && type === 'up') {
        dummy.subCategory = up(dummy.subCategory, grade2Index);
      } else if (grade2Index !== -1 && type === 'down') {
        dummy.subCategory = down(dummy.subCategory, grade2Index);
      } else if (grade2Index === -1) {

        // grade1에 없으니까, grade2로 이동 해서 검색..
        dummy.subCategory.forEach(grade2 => {
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
    this.category = Object.assign({}, dummy);
    console.log(this.category);
  }

  // 카테고리 메이커 내의 항목을 삭제시켜줘요.
  removeArticle(event, id: string) {
    if (event) { event.stopPropagation(); }

    // ---- 정리용도 함수 모음 -----------------------------------
    function hasMoreSubCategory(obj: any) {
      if (obj.subCategory !== undefined &&
          obj.subCategory.length > 0) {
        return true;
      } else {
        return false;
      }
    }

    // ---- 정리용도 함수 모음 끝 -------------------------------

    const dummy = Object.assign({}, this.category);

    if (dummy._id === id) {
      // Root 삭제. 지원 안해줄것임.
    } else {
      if (hasMoreSubCategory(dummy)) {

        const lengthBefore = dummy.subCategory.length;
        dummy.subCategory = dummy.subCategory.filter(grade2 => {
          return grade2._id === id ? false : true;
        });

        if (lengthBefore === dummy.subCategory.length) {
          // grade3 고고
          dummy.subCategory = dummy.subCategory.map(value2 => {
            if (hasMoreSubCategory(value2)) {
              value2.subCategory = value2.subCategory.filter(value3 => {
                return value3._id === id ? false : true;
              });
            }
            return value2;
          });
        }
      }
    }
    this.category = Object.assign({}, dummy); // 바인딩 문제 때문에 이렇게 처리해야 해요.
    console.log(this.category);
  }

  // 모달 닫기
  closeModal(event) {
    if (event) { event.stopPropagation(); }

    this.cancel.emit(event);
  }
}
