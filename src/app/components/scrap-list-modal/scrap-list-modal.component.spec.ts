import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapListModalComponent } from './scrap-list-modal.component';

describe('ScrapListModalComponent', () => {
  let component: ScrapListModalComponent;
  let fixture: ComponentFixture<ScrapListModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrapListModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrapListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
