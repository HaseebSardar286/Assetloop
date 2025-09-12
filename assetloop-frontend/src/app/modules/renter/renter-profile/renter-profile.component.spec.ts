import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenterProfileComponent } from './renter-profile.component';

describe('RenterProfileComponent', () => {
  let component: RenterProfileComponent;
  let fixture: ComponentFixture<RenterProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenterProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenterProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
