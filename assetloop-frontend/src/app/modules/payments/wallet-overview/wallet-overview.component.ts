import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../../interfaces/payments';
import { PaymentsService } from '../../../services/payments.service';

@Component({
  selector: 'app-wallet-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet-overview.component.html',
  styleUrls: ['./wallet-overview.component.css'],
})
export class WalletOverviewComponent {
  currentBalance: number = 0;
  pendingPayments: Transaction[] = [];
  earningsRefunds: Transaction[] = [];
  loading = false;
  error: string | null = null;

  addWithdrawAmount = 0;

  constructor(private paymentsService: PaymentsService) {
    this.loadWallet();
  }

  loadWallet(): void {
    this.loading = true;
    this.error = null;
    this.paymentsService.getWallet().subscribe({
      next: (res) => {
        this.currentBalance = res.balance || 0;
        // Filter transactions for display if needed, or just show recent ones
        // For now, let's categorize them roughly if the UI expects these arrays
        const txns = res.transactions || [];
        this.pendingPayments = txns.filter(t => t.status === 'pending');
        this.earningsRefunds = txns.filter(t => t.type === 'refund' || t.type === 'payout');
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load wallet data';
        this.loading = false;
      },
    });
  }

  addMoney(): void {
    if (this.addWithdrawAmount <= 0) return;
    this.loading = true;
    this.error = null;
    this.paymentsService.addMoney(this.addWithdrawAmount).subscribe({
      next: (res) => {
        if (res.url) {
          window.location.href = res.url;
        } else {
          this.error = 'Failed to initiate payment';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to add money';
        this.loading = false;
      },
    });
  }

  withdraw(): void {
    if (this.addWithdrawAmount <= 0) return;
    this.loading = true;
    this.error = null;
    this.paymentsService.withdraw(this.addWithdrawAmount).subscribe({
      next: (res) => {
        this.currentBalance = res.balance;
        this.addWithdrawAmount = 0;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to withdraw';
        this.loading = false;
      },
    });
  }
}
