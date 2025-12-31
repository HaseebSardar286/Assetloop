import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { RenterSideBarComponent } from '../../renter/renter-side-bar/renter-side-bar.component';
import { AuthService } from '../../../services/auth.service';
import { PaymentsService } from '../../../services/payments.service';
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
    HeaderComponent,
    RenterSideBarComponent,
    WalletOverviewComponent,
    TransactionHistoryComponent,
    PaymentMethodsComponent,
    BookingPaymentsComponent,
    InvoicesReceiptsComponent,
    RefundsDisputesComponent,
    // SecurityFeaturesComponent,
  ],
  templateUrl: './payments-wallet.component.html',
  styleUrl: './payments-wallet.component.css'
})
export class PaymentsWalletComponent implements OnInit {
  activeTab: string = 'overview';
  @ViewChild(WalletOverviewComponent) walletOverview?: WalletOverviewComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private paymentsService: PaymentsService
  ) { }

  ngOnInit(): void {
    // Check for payment status in URL params
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      const sessionId = params['session_id'];
      const source = params['source'];

      if (status === 'success' && sessionId) {
        // Verify payment and refresh wallet
        this.verifyAndRefreshPayment(sessionId);
      } else if (status === 'success' && source === 'wallet_topup') {
        // If no session_id but success status, try to refresh wallet anyway
        // The webhook might have already processed it
        setTimeout(() => {
          if (this.walletOverview) {
            this.walletOverview.loadWallet();
          }
        }, 2000); // Wait 2 seconds for webhook to process
      }
    });
  }

  verifyAndRefreshPayment(sessionId: string): void {
    this.paymentsService.verifyPayment(sessionId).subscribe({
      next: (result) => {
        if (result.success) {
          console.log('✅ Payment verified:', result.message);
          if (result.balance !== undefined) {
            console.log('💰 New balance:', result.balance);
          }
          // Refresh wallet to show updated balance
          if (this.walletOverview) {
            this.walletOverview.loadWallet();
          }
          // Remove query params from URL
          this.router.navigate(['/payments'], { replaceUrl: true });
        } else {
          console.warn('⚠️ Payment verification failed:', result.message);
        }
      },
      error: (err) => {
        console.error('❌ Error verifying payment:', err);
        // Still try to refresh wallet in case webhook processed it
        if (this.walletOverview) {
          setTimeout(() => {
            this.walletOverview?.loadWallet();
          }, 2000);
        }
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
  }

  onNavigate(event: Event): void {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      console.log('Navigating to:', path);
      this.router.navigate([path]);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
