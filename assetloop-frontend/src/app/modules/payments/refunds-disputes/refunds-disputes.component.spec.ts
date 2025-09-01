import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundsDisputesComponent } from './refunds-disputes.component';

describe('RefundsDisputesComponent', () => {
  let component: RefundsDisputesComponent;
  let fixture: ComponentFixture<RefundsDisputesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefundsDisputesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefundsDisputesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
