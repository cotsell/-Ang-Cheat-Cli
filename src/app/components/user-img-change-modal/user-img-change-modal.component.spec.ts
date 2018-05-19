import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserImgChangeModalComponent } from './user-img-change-modal.component';

describe('UserImgChangeModalComponent', () => {
  let component: UserImgChangeModalComponent;
  let fixture: ComponentFixture<UserImgChangeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserImgChangeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserImgChangeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
