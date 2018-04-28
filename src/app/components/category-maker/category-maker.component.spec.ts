import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryMakerComponent } from './category-maker.component';

describe('CategoryMakerComponent', () => {
  let component: CategoryMakerComponent;
  let fixture: ComponentFixture<CategoryMakerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryMakerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
