import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-titlebar',
  templateUrl: './titlebar.component.html',
  styleUrls: ['./titlebar.component.scss']
})
export class TitlebarComponent implements OnInit, OnDestroy {
  private isSearchBarOpen = false;

  constructor() { }

  ngOnInit() { }

  private changeSearchBarState(event) {
    event.stopPropagation();
    this.isSearchBarOpen = !this.isSearchBarOpen;
  }

  ngOnDestroy() { }

}
