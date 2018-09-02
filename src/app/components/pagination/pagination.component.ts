/* Input
  cursor: 필수. 숫자. 1이상. 현재 선택된 페이지 숫자에요.
  totalArticle: 필수. 숫자. 총 게시물의 숫자에요. 페이지와 최대 페이지를 계산할때 사용.
  perPage: 필수. 숫자. 한 페이지에 게시물을 몇개 보여줄지 원하는 숫자를 넣으세요.

Output
  output: 새로 선택된 페이지 숫자를 전달해 줘요. */


import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

interface Page {
  num: number;
  selected: boolean;
}

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() cursor = 1;
  @Input() totalArticle = 0;
  @Input() perPage = 10;
  @Output() output: EventEmitter<number> = new EventEmitter();
  MAX_PAGE = 0;
  pages: Page[] = [];

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.reRender();
    console.log(this.pages);
    console.log(`${this.cursor} : ${this.totalArticle} : ${this.perPage}`);
  }

  reRender() {
    let start = 1;
    let end = 10;
    this.MAX_PAGE = (this.totalArticle / this.perPage);

    if ((this.totalArticle % this.perPage) > 0) {
      this.MAX_PAGE += 1;
    }
    // console.log((this.totalArticle % this.perPage));

    this.pages = [];

    if (this.MAX_PAGE <= 10) {
      for (let i = start; i <= this.MAX_PAGE; i++) {
        draw(i, this.cursor, this.pages);
      }
    } else { // 총페이지가 10보다 크고..
      if (this.cursor < 6) { // 커서가 6보다 작으면..
        start = 1;
        end = 10;
      } else { // 커서가 6보다 크면..
        if (this.cursor < (this.MAX_PAGE - 9)) {
          start = this.cursor - 4;
          end = this.cursor + 4;
        } else {
          start = this.MAX_PAGE - 9;
          end = this.MAX_PAGE;
        }
      }
      // for (let i = start; i < (start + 9); i++) {
      console.log(`start: ${start}, end: ${end}, cursor: ${this.cursor}, max-page: ${this.MAX_PAGE}`);

      for (let i = start; i <= end; i++) {
        draw(i, this.cursor, this.pages);
      }
    }

    function draw(number, cursor, pages) {
        if (cursor === number) {
            pages.push({ num: number, selected: true });
        } else {
            pages.push({ num: number, selected: false });
        }
    }
  }

  // 페이지 변경을 하면 실행되는 함수에요
  outputCursor(number, event?) {
    if (event) { event.stopPropagation(); }

    this.output.emit(number);
  }

  // 왼쪽방향 커서를 클릭하면 실행
  leftCursor(event) {
    event.stopPropagation();

    const result = this.cursor - 1;
    if (result < 1) {
      this.outputCursor(1);
    } else {
      this.outputCursor(result);
    }
  }

  // 오른쪽 방향 커서를 클릭하면 실행
  rightCursor(event) {
    event.stopPropagation();

    const result = this.cursor + 1;
    if (result > this.MAX_PAGE) {
      this.outputCursor(this.MAX_PAGE);
    } else {
      this.outputCursor(result);
    }
  }

}
