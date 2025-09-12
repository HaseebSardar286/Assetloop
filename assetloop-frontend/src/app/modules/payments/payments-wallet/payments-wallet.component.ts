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

  constructor(private router: Router) {}

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
