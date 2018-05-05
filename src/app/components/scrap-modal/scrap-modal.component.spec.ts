import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapModalComponent } from './scrap-modal.component';

describe('ScrapModalComponent', () => {
  let component: ScrapModalComponent;
  let fixture: ComponentFixture<ScrapModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrapModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrapModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
