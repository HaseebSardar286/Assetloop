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
      console.log('🔍 Payment redirect params:', params);
      const status = params['status'];
      const sessionId = params['session_id'];
      const source = params['source'];

      if (status === 'success' && sessionId) {
        console.log('✅ Payment success detected, verifying session:', sessionId);
        // Verify payment and refresh wallet
        this.verifyAndRefreshPayment(sessionId);
      } else if (status === 'success' && source === 'wallet_topup') {
        console.log('⚠️ Success status but no session_id, refreshing wallet after delay...');
        // If no session_id but success status, try to refresh wallet anyway
        // The webhook might have already processed it
        setTimeout(() => {
          if (this.walletOverview) {
            console.log('🔄 Refreshing wallet...');
            this.walletOverview.loadWallet();
          }
        }, 2000); // Wait 2 seconds for webhook to process
      } else if (status === 'success') {
        console.log('⚠️ Success status but no session_id or source, refreshing wallet...');
        // Just refresh wallet if we see success
        setTimeout(() => {
          if (this.walletOverview) {
            this.walletOverview.loadWallet();
          }
        }, 2000);
      }
    });
  }

  verifyAndRefreshPayment(sessionId: string): void {
    console.log('🔍 Verifying payment with session ID:', sessionId);
    this.paymentsService.verifyPayment(sessionId).subscribe({
      next: (result) => {
        console.log('📦 Verification response:', result);
        if (result.success) {
          console.log('✅ Payment verified:', result.message);
          if (result.balance !== undefined) {
            console.log('💰 New balance:', result.balance);
          }
          // Refresh wallet to show updated balance
          this.refreshWallet();
          // Remove query params from URL after a short delay
          setTimeout(() => {
            this.router.navigate(['/payments'], { replaceUrl: true });
          }, 1000);
        } else {
          console.warn('⚠️ Payment verification failed:', result.message);
          // Still refresh wallet in case webhook processed it
          if (this.walletOverview) {
            setTimeout(() => {
              this.walletOverview?.loadWallet();
            }, 2000);
          }
        }
      },
      error: (err) => {
        console.error('❌ Error verifying payment:', err);
        console.error('Error details:', err.error);
        // Still try to refresh wallet in case webhook processed it
        if (this.walletOverview) {
          setTimeout(() => {
            console.log('🔄 Refreshing wallet after error...');
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

  private refreshWallet(): void {
    // Try multiple methods to refresh wallet
    if (this.walletOverview) {
      this.walletOverview.loadWallet();
    } else {
      console.warn('⚠️ WalletOverview component not available, retrying...');
      // Retry after a short delay
      setTimeout(() => {
        if (this.walletOverview) {
          this.walletOverview.loadWallet();
        } else {
          // If ViewChild still not available, directly call the service
          console.log('🔄 Refreshing wallet via service...');
          this.paymentsService.getWallet().subscribe({
            next: (res) => {
              console.log('💰 Wallet refreshed via service, balance:', res.balance);
              // Force component update by switching tabs
              const currentTab = this.activeTab;
              this.activeTab = 'transactions';
              setTimeout(() => {
                this.activeTab = currentTab;
              }, 100);
            },
            error: (err) => {
              console.error('❌ Error refreshing wallet:', err);
            }
          });
        }
      }, 500);
    }
  }
}
