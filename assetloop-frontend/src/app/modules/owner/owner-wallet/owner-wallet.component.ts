import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaymentsService } from '../../../services/payments.service';
import { AuthService } from '../../../services/auth.service';
import { PaymentMethod, Transaction } from '../../../interfaces/payments';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';
import { PaymentMethodsComponent } from '../../payments/payment-methods/payment-methods.component';

@Component({
  selector: 'app-owner-wallet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    OwnerSideBarComponent,
    PaymentMethodsComponent,
  ],
  templateUrl: './owner-wallet.component.html',
  styleUrls: ['./owner-wallet.component.css'],
})
export class OwnerWalletComponent {
  balance = 0;
  transactions: Transaction[] = [];
  filteredType: 'all' | 'earnings' | 'withdrawals' = 'all';
  totalEarnings = 0;
  totalWithdrawn = 0;
  payoutMethods: PaymentMethod[] = [];
  selectedPayoutMethodId: string | number | null = null;
  loading = false;
  error: string | null = null;
  amount = 0;

  constructor(
    private paymentsService: PaymentsService,
    private authService: AuthService
  ) {
    this.loadWallet();
  }

  loadWallet(): void {
    this.loading = true;
    this.error = null;
    this.paymentsService.getWallet().subscribe({
      next: (res) => {
        this.balance = res.balance || 0;
        this.transactions = res.transactions || [];
        this.computeSummaries();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load wallet';
        this.loading = false;
      },
    });

    // Load payout methods for the current owner
    this.paymentsService.getPaymentMethods().subscribe({
      next: (methods) => {
        this.payoutMethods = methods || [];
        const def = this.payoutMethods.find((m) => m.isDefault);
        this.selectedPayoutMethodId = def?.id ?? this.payoutMethods[0]?.id ?? null;
      },
      error: () => {
        // Failing to load payout methods shouldn't break the wallet view
      },
    });
  }

  computeSummaries(): void {
    const earnings = this.transactions.filter(
      (t) => t.type === 'payout' || t.type === 'deposit'
    );
    const withdrawals = this.transactions.filter(
      (t) => t.type === 'withdrawal'
    );

    this.totalEarnings = earnings.reduce((sum, t) => sum + (t.amount || 0), 0);
    this.totalWithdrawn = withdrawals.reduce(
      (sum, t) => sum + Math.abs(t.amount || 0),
      0
    );
  }

  setFilter(type: 'all' | 'earnings' | 'withdrawals'): void {
    this.filteredType = type;
  }

  getFilteredTransactions(): Transaction[] {
    if (this.filteredType === 'earnings') {
      return this.transactions.filter(
        (t) => t.type === 'payout' || t.type === 'deposit'
      );
    }
    if (this.filteredType === 'withdrawals') {
      return this.transactions.filter((t) => t.type === 'withdrawal');
    }
    return this.transactions;
  }

  withdraw(): void {
    if (this.amount <= 0) return;
    if (this.amount > this.balance) {
      this.error = 'Amount exceeds available balance';
      return;
    }
    this.loading = true;
    this.error = null;
    this.paymentsService
      .withdraw(this.amount, this.selectedPayoutMethodId ?? undefined)
      .subscribe({
      next: (res) => {
        this.balance = res.balance;
        this.amount = 0;
        this.loadWallet();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to withdraw';
        this.loading = false;
      },
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}


