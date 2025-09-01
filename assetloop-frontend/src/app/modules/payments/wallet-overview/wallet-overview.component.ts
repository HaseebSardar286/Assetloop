import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../../interfaces/payments';

@Component({
  selector: 'app-wallet-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet-overview.component.html',
  styleUrls: ['./wallet-overview.component.css'],
})
export class WalletOverviewComponent {
  currentBalance: number = 5000;
  pendingPayments: Transaction[] = [
    {
      id: 1,
      amount: 2000,
      status: 'pending',
      method: 'card',
      date: '2025-08-31',
      type: 'rent',
    },
  ];
  earningsRefunds: Transaction[] = [
    {
      id: 2,
      amount: 1000,
      status: 'successful',
      method: 'wallet',
      date: '2025-08-30',
      type: 'refund',
    },
  ];
}
