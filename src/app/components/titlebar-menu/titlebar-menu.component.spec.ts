import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TitlebarMenuComponent } from './titlebar-menu.component';

describe('TitlebarMenuComponent', () => {
  let component: TitlebarMenuComponent;
  let fixture: ComponentFixture<TitlebarMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TitlebarMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TitlebarMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
