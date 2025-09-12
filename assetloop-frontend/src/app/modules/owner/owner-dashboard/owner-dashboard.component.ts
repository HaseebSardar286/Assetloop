import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Booking } from '../../../interfaces/bookings';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';
import { OwnerService } from '../../../services/owner.service';
import { DashboardStats } from '../../../interfaces/ownerDashboard';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, OwnerSideBarComponent],
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.css'],
})
export class OwnerDashboardComponent {
  stats: DashboardStats = {
    totalAssets: 0,
    activeBookings: 0,
    totalEarnings: 0,
    pendingReviews: 0,
  };
  activeBookings: Booking[] = [];

  constructor(private ownerService: OwnerService) {}
  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadActiveBookings();
  }
  loadDashboardStats(): void {
    this.ownerService.getDashboardStats().subscribe({
      next: (data: DashboardStats) => {
        this.stats = data;
        console.log('Dashboard stats:', data);
      },
      error: (err: String) => {
        console.error('Error loading dashboard stats:', err);
        alert('Failed to load dashboard stats');
      },
    });
  }

  loadActiveBookings(): void {
    this.ownerService.getActiveBookings().subscribe({
      next: (bookings: Booking[]) => {
        this.activeBookings = bookings;
        console.log('Active bookings:', bookings);
      },
      error: (err: String) => {
        console.error('Error loading active bookings:', err);
        alert('Failed to load active bookings');
      },
    });
  }

  getStatsArray(): { title: string; value: number }[] {
    return [
      { title: 'Total Assets', value: this.stats.totalAssets },
      { title: 'Active Bookings', value: this.stats.activeBookings },
      { title: 'Total Earnings', value: this.stats.totalEarnings },
      { title: 'Pending Reviews', value: this.stats.pendingReviews },
    ];
  }

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
