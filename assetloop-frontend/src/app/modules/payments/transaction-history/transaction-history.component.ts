import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../../interfaces/payments';
import { TransactionCardComponent } from '../transaction-card/transaction-card.component';

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
  transactions: Transaction[] = [
    {
      id: 1,
      amount: 2000,
      status: 'successful',
      method: 'card',
      date: '2025-08-30',
      type: 'rent',
    },
    {
      id: 2,
      amount: 500,
      status: 'pending',
      method: 'wallet',
      date: '2025-08-31',
      type: 'service fee',
    },
  ];

  getFilteredTransactions() {
    return this.transactions.filter(
      (t) =>
        (!this.filterDate || t.date.includes(this.filterDate)) &&
        (!this.filterType || (t.type && t.type.includes(this.filterType)))
    );
  }
}
