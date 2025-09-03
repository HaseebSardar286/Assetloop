import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Booking } from '../../../interfaces/bookings';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, OwnerSideBarComponent],
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.css'],
})
export class OwnerDashboardComponent {
  totalAssets: number = 3;
  activeBookings: Booking[] = [
    {
      id: 1,
      name: 'Honda Civic',
      address: 'Lahore',
      dates: '2025-09-01 to 2025-09-03',
      total: 'PKR 6,000',
      status: 'active',
    },
    {
      id: 2,
      name: '2-Bedroom Apartment',
      address: 'Karachi',
      dates: '2025-09-01 to 2025-09-05',
      total: 'PKR 20,000',
      status: 'active',
    },
  ];
  totalEarnings: number = 26000;
  pendingReviews: number = 1;

  onLogout() {
    // Handle logout
  }

  onNavigate(event: Event) {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      console.log('Navigating to:', path);
    }
  }
}
