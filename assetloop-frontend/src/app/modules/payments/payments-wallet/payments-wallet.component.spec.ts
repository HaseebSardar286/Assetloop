import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsWalletComponent } from './payments-wallet.component';

describe('PaymentsWalletComponent', () => {
  let component: PaymentsWalletComponent;
  let fixture: ComponentFixture<PaymentsWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsWalletComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
