import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyArticleComponent } from './reply-article.component';

describe('ReplyArticleComponent', () => {
  let component: ReplyArticleComponent;
  let fixture: ComponentFixture<ReplyArticleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplyArticleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplyArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
