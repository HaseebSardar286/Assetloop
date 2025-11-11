import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../../interfaces/payments';
import { TransactionCardComponent } from '../transaction-card/transaction-card.component';
import { PaymentsService } from '../../../services/payments.service';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionCardComponent],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css'],
})
export class TransactionHistoryComponent {
  filterDate: string = '';
  filterType: string = '';
  transactions: Transaction[] = [];
  loading = false;
  error: string | null = null;

  constructor(private paymentsService: PaymentsService) {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.paymentsService.getTransactions().subscribe({
      next: (txns) => {
        this.transactions = txns || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load transactions';
        this.loading = false;
      },
    });
  }

  getFilteredTransactions() {
    return this.transactions.filter(
      (t) =>
        (!this.filterDate || t.date.includes(this.filterDate)) &&
        (!this.filterType || (t.type && t.type.includes(this.filterType)))
    );
  }
}
