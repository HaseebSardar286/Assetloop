import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingItemComponent } from './booking-item.component';

describe('BookingItemComponent', () => {
  let component: BookingItemComponent;
  let fixture: ComponentFixture<BookingItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
