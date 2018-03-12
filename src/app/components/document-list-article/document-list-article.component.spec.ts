import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentListArticleComponent } from './document-list-article.component';

describe('DocumentListArticleComponent', () => {
  let component: DocumentListArticleComponent;
  let fixture: ComponentFixture<DocumentListArticleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentListArticleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentListArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
