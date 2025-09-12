import { Routes } from '@angular/router';
import { PaymentsWalletComponent } from './payments-wallet/payments-wallet.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { PaymentMethodsComponent } from './payment-methods/payment-methods.component';
import { InvoicesReceiptsComponent } from './invoices-receipts/invoices-receipts.component';
import { RefundsDisputesComponent } from './refunds-disputes/refunds-disputes.component';
import { SecurityFeaturesComponent } from './security-features/security-features.component';
import { BookingPaymentsComponent } from './booking-payments/booking-payments.component';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    component: PaymentsWalletComponent,
    data: { title: 'Payments & Wallet' }
  },
  {
    path: 'wallet',
    component: PaymentsWalletComponent,
    data: { title: 'Wallet Overview' }
  },
  {
    path: 'history',
    component: TransactionHistoryComponent,
    data: { title: 'Transaction History' }
  },
  {
    path: 'methods',
    component: PaymentMethodsComponent,
    data: { title: 'Payment Methods' }
  },
  {
    path: 'invoices',
    component: InvoicesReceiptsComponent,
    data: { title: 'Invoices & Receipts' }
  },
  {
    path: 'refunds',
    component: RefundsDisputesComponent,
    data: { title: 'Refunds & Disputes' }
  },
  {
    path: 'security',
    component: SecurityFeaturesComponent,
    data: { title: 'Security Features' }
  },
  {
    path: 'booking/:id',
    component: BookingPaymentsComponent,
    data: { title: 'Booking Payment' }
  }
];