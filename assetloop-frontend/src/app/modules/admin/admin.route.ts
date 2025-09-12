import { Routes } from '@angular/router';
import { PaymentsWalletComponent } from '../payments/payments-wallet/payments-wallet.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { ListingManagementComponent } from './listing-management/listing-management.component';
import { ReviewsManagementComponent } from './reviews-management/reviews-management.component';
import { TransactionManagementComponent } from './transaction-management/transaction-management.component';
import { SystemSettingsComponent } from './system-settings/system-settings.component';

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
    path: 'manage-transactions',
    component: TransactionManagementComponent,
    data: { title: 'Manage Transactions' },
  },

  {
    path: 'system-settings',
    component: SystemSettingsComponent,
    data: { title: 'System Settings' },
  },
];
