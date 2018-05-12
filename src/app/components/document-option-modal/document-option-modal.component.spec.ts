import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentOptionModalComponent } from './document-option-modal.component';

describe('DocumentOptionModalComponent', () => {
  let component: DocumentOptionModalComponent;
  let fixture: ComponentFixture<DocumentOptionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentOptionModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentOptionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
