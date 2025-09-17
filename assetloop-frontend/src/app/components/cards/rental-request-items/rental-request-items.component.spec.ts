import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalRequestItemsComponent } from './rental-request-items.component';

describe('RentalRequestItemsComponent', () => {
  let component: RentalRequestItemsComponent;
  let fixture: ComponentFixture<RentalRequestItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalRequestItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RentalRequestItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
