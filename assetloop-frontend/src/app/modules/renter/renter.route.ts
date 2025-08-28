import { Routes } from '@angular/router';
import { RenterDashboardComponent } from './renter-dashboard/renter-dashboard.component';
import { SearchListingsComponent } from './search-listings/search-listings.component';
import { RenterProfileComponent } from './renter-profile/renter-profile.component';
import { MyBookingsComponent } from './my-bookings/my-bookings.component';

export const RENTER_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: RenterDashboardComponent,
    data: { title: 'Renter Dashboard' },
  },
  {
    path: 'search',
    component: SearchListingsComponent,
    data: { title: 'Search Listings' },
  },
  // {
  //   path: 'asset/:id',
  //   component: AssetDetailsComponent,
  //   data: { title: 'Asset Details' },
  // },
  {
    path: 'booking-history',
    component: MyBookingsComponent,
    data: { title: 'Booking History' },
  },

  {
    path: 'profile',
    component: RenterProfileComponent,
    data: { title: 'Renter Profile' },
  },
];
