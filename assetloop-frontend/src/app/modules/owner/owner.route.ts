import { Routes } from '@angular/router';
import { OwnerDashboardComponent } from './owner-dashboard/owner-dashboard.component';
import { AssetManagementComponent } from './asset-management/asset-management.component';
import { BookingManagementComponent } from './booking-management/booking-management.component';
import { CreateAssetComponent } from './create-asset/create-asset.component';
import { OwnerProfileComponent } from './owner-profile/owner-profile.component';
import { ChatComponent } from './chat/chat.component';

export const OWNER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: OwnerDashboardComponent,
    data: { title: 'Owner Dashboard' },
  },
  {
    path: 'assets',
    component: AssetManagementComponent,
    data: { title: 'Asset Management' },
  },
  {
    path: 'bookings',
    component: BookingManagementComponent,
    data: { title: 'Booking Management' },
  },
  {
    path: 'create-asset',
    component: CreateAssetComponent,
    data: { title: 'Create Asset' },
  },
  {
    path: 'profile',
    component: OwnerProfileComponent,
    data: { title: 'Owner Profile' },
  },
  {
    path: 'chat',
    component: ChatComponent,
    data: { title: 'Chat' },
  },
];
