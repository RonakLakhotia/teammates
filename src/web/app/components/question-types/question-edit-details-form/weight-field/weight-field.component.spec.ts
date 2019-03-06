import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightFieldComponent } from './weight-field.component';

describe('WeightFieldComponent', () => {
  let component: WeightFieldComponent;
  let fixture: ComponentFixture<WeightFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WeightFieldComponent],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeightFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
