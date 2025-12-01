import { PaymentsService } from '../../../services/payments.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Invoice } from '../../../interfaces/payments';

@Component({
  selector: 'app-invoices-receipts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoices-receipts.component.html',
  styleUrls: ['./invoices-receipts.component.css'],
})
export class InvoicesReceiptsComponent {
  invoices: Invoice[] = [];
  loading = false;
  error: string | null = null;

  constructor(private paymentsService: PaymentsService) {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading = true;
    this.paymentsService.getInvoices().subscribe({
      next: (data) => {
        this.invoices = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load invoices';
        this.loading = false;
      }
    });
  }
}
