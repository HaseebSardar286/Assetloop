import { Routes } from '@angular/router';
import { PaymentsWalletComponent } from '../payments/payments-wallet/payments-wallet.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { ListingManagementComponent } from './listing-management/listing-management.component';
import { ReviewsManagementComponent } from './reviews-management/reviews-management.component';
import { DisputeResolutionComponent } from './dispute-resolution/dispute-resolution.component';
import { TransactionManagementComponent } from './transaction-management/transaction-management.component';

import { SystemSettingsComponent } from './system-settings/system-settings.component';
import { AdminVerificationComponent } from './admin-verification/admin-verification.component';
import { VerificationDetailsComponent } from './verification-details/verification-details.component';
import { AssetDetailsComponent } from './asset-details/asset-details.component';
import { UserDetailsComponent } from './user-details/user-details.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
  },

  {
    path: 'dashboard',
    component: AdminDashboardComponent,
    data: { title: 'Admin Dashboard' },
  },

  {
    path: 'manage-users',
    component: UserManagementComponent,
    data: { title: 'Manage Users' },
  },

  {
    path: 'manage-listings',
    component: ListingManagementComponent,
    data: { title: 'Manage Listings' },
  },

  {
    path: 'manage-reviews',
    component: ReviewsManagementComponent,
    data: { title: 'Manage Reviews' },
  },
  {
    path: 'manage-disputes',
    component: DisputeResolutionComponent,
    data: { title: 'Dispute Resolution' },
  },
  {
    path: 'manage-transactions',

    component: TransactionManagementComponent,
    data: { title: 'Manage Transactions' },
  },

  {
    path: 'system-settings',
    component: SystemSettingsComponent,
    data: { title: 'System Settings' },
  },

  {
    path: 'account-verification',
    component: AdminVerificationComponent,
    data: { title: 'Account Verification' },
  },
  {
    path: 'verification/details/:id',
    component: VerificationDetailsComponent,
    data: { title: 'Verification Details' },
  },
  {
    path: 'listings/details/:id',
    component: AssetDetailsComponent,
    data: { title: 'Listing Details' },
  },
  {
    path: 'users/details/:id',
    component: UserDetailsComponent,
    data: { title: 'User Details' },
  },
];
