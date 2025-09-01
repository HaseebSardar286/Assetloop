import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingPaymentsComponent } from './booking-payments.component';

describe('BookingPaymentsComponent', () => {
  let component: BookingPaymentsComponent;
  let fixture: ComponentFixture<BookingPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingPaymentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
