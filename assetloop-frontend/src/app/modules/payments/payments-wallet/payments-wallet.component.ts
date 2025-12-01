import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { RenterSideBarComponent } from '../../renter/renter-side-bar/renter-side-bar.component';
import { WalletOverviewComponent } from '../wallet-overview/wallet-overview.component';
import { TransactionHistoryComponent } from '../transaction-history/transaction-history.component';
import { PaymentMethodsComponent } from '../payment-methods/payment-methods.component';
import { BookingPaymentsComponent } from '../booking-payments/booking-payments.component';
import { InvoicesReceiptsComponent } from '../invoices-receipts/invoices-receipts.component';
import { RefundsDisputesComponent } from '../refunds-disputes/refunds-disputes.component';
import { SecurityFeaturesComponent } from '../security-features/security-features.component';
import { PaymentsService } from '../../../services/payments.service';
import { Transaction } from '../../../interfaces/payments';

@Component({
  selector: 'app-payments-wallet',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    RenterSideBarComponent,
    WalletOverviewComponent,
    TransactionHistoryComponent,
    PaymentMethodsComponent,
    BookingPaymentsComponent,
    InvoicesReceiptsComponent,
    RefundsDisputesComponent,
    SecurityFeaturesComponent,
  ],
  templateUrl: './payments-wallet.component.html',
  styleUrls: ['./payments-wallet.component.css'],
})
export class PaymentsWalletComponent {
  activeTab: string = 'overview';
  balance = 0;
  transactions: any[] = [];
  loading = false;

  constructor(
    private router: Router,
    private paymentsService: PaymentsService
  ) {
    this.loadWallet();
  }

  loadWallet() {
    this.loading = true;
    this.paymentsService.getWallet().subscribe({
      next: (data: { balance: number; transactions: Transaction[] }) => {
        this.balance = data.balance;
        this.transactions = data.transactions;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load wallet', err);
        this.loading = false;
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onLogout() {
    this.router.navigate(['/auth/login']);
  }

  onNavigate(event: Event) {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      this.router.navigate([path]);
    }
  }
}
