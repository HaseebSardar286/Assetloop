import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalRequestsComponent } from './rental-requests.component';

describe('RentalRequestsComponent', () => {
  let component: RentalRequestsComponent;
  let fixture: ComponentFixture<RentalRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RentalRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
