import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesReceiptsComponent } from './invoices-receipts.component';

describe('InvoicesReceiptsComponent', () => {
  let component: InvoicesReceiptsComponent;
  let fixture: ComponentFixture<InvoicesReceiptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicesReceiptsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicesReceiptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
