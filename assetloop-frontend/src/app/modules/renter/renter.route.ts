import { Routes } from '@angular/router';
import { RenterDashboardComponent } from './renter-dashboard/renter-dashboard.component';
import { SearchListingsComponent } from './search-listings/search-listings.component';
import { RenterProfileComponent } from './renter-profile/renter-profile.component';
import { MyBookingsComponent } from './my-bookings/my-bookings.component';
import { HomeComponent } from '../../components/home/home.component';
import { AssetDetailsComponent } from './asset-details/asset-details.component';
import { FavouritesComponent } from './favourites/favourites.component';
import { ChatComponent } from '../chat/components/chat/chat.component';
import { PaymentsWalletComponent } from '../payments/payments-wallet/payments-wallet.component';
import { ReviewComponent } from './review/review.component';
import { CartComponent } from './cart/cart.component';
import { RequestedAssetsComponent } from './requested-assets/requested-assets.component';

export const RENTER_ROUTES: Routes = [
  {
    path: '',
    component: RenterDashboardComponent,
    data: { title: 'Renter Dashboard' },
  },
  {
    path: 'dashboard',
    component: RenterDashboardComponent,
  },
  {
    path: 'search',
    component: SearchListingsComponent,
    data: { title: 'Search Listings' },
  },
  {
    path: 'asset/:id',
    component: AssetDetailsComponent,
    data: { title: 'Asset Details' },
  },
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

  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'Home' },
  },
  {
    path: 'favourites',
    component: FavouritesComponent,
    data: { title: 'Favourites' },
  },

  {
    path: 'requested-assets',
    component: RequestedAssetsComponent,
    data: { title: 'Requested Assets' },
  },
  {
    path: 'payments',
    component: PaymentsWalletComponent,
    data: { title: 'Payments' },
  },
  {
    path: 'cart',
    component: CartComponent,
    data: { title: 'My Cart' },
  },
  {
    path: 'review/:id',
    component: ReviewComponent,
    data: { title: 'Leave Review' },
  },
  {
    path: 'chat',
    component: ChatComponent,
    data: { title: 'Chat' },
  },
];
