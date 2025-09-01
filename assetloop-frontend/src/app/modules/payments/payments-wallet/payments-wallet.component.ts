import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
  onLogout() {
    // Handle logout
  }

  onNavigate(event: Event) {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      // Extract the path from the href attribute
      const path = target.getAttribute('href')!;
      // Navigate using the Router (implement navigation logic)
      console.log('Navigating to:', path);
      // Example: this.router.navigate([path]); // Uncomment and inject Router if needed
    }
  }
}
