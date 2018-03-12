import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-titlebar-menu',
  templateUrl: './titlebar-menu.component.html',
  styleUrls: ['./titlebar-menu.component.scss']
})
export class TitlebarMenuComponent implements OnInit {
  private isMenuHidden = true;

  constructor() { }

  ngOnInit() {
  }

  // 메뉴의 상세 내용의 화면 출력 여부를 변경해요.
  changeMenuState(event) {
    event.stopPropagation();
    this.isMenuHidden = !this.isMenuHidden;
  }

}
