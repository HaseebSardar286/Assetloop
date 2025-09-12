import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice } from '../../../interfaces/payments';

@Component({
  selector: 'app-invoices-receipts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoices-receipts.component.html',
  styleUrls: ['./invoices-receipts.component.css'],
})
export class InvoicesReceiptsComponent {
  invoices: Invoice[] = [
    {
      id: 1,
      bookingId: 1,
      asset: 'Honda Civic',
      dates: '2025-09-01 to 2025-09-05',
      amounts: { rent: 2000, fees: 100 },
      status: 'paid',
    },
  ];
}
