import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityFeaturesComponent } from './security-features.component';

describe('SecurityFeaturesComponent', () => {
  let component: SecurityFeaturesComponent;
  let fixture: ComponentFixture<SecurityFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityFeaturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
