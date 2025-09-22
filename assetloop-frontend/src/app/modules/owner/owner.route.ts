import { Routes } from '@angular/router';
import { OwnerDashboardComponent } from './owner-dashboard/owner-dashboard.component';
import { CreateAssetComponent } from './create-asset/create-asset.component';
import { OwnerProfileComponent } from './owner-profile/owner-profile.component';
import { MyListingsComponent } from './my-listing/my-listing.component';
import { RentalRequestsComponent } from './rental-requests/rental-requests.component';
import { ChatComponent } from '../chat/components/chat/chat.component';

export const OWNER_ROUTES: Routes = [
  {
    path: '',
    component: OwnerDashboardComponent,
    data: { title: 'Owner Dashboard' },
  },

  {
    path: 'dashboard',
    component: OwnerDashboardComponent,
  },
  {
    path: 'assets',
    component: MyListingsComponent,
    data: { title: 'Asset Management' },
  },
  {
    path: 'rentals',
    component: RentalRequestsComponent,
    data: { title: 'Rental Requests' },
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
    data: { title: 'Owner Chat' },
  },
];
