import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Booking } from '../../../interfaces/bookings';
import { Review } from '../../../interfaces/review';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';
import { OwnerService } from '../../../services/owner.service';
import { DashboardStats } from '../../../interfaces/ownerDashboard';
import { User } from '../../../interfaces/user';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBoxArchive,
  faCalendarCheck,
  faWallet,
  faStarHalfStroke,
  faArrowUpRightFromSquare,
  faChartLine,
  faComments,
  faScrewdriverWrench,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    OwnerSideBarComponent,
    FontAwesomeModule,
  ],
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.css'],
})
export class OwnerDashboardComponent implements OnInit {
  faBoxArchive = faBoxArchive;
  faCalendarCheck = faCalendarCheck;
  faWallet = faWallet;
  faStarHalfStroke = faStarHalfStroke;
  faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  faChartLine = faChartLine;
  faComments = faComments;
  faScrewdriverWrench = faScrewdriverWrench;
  userName = 'Owner';
  stats: DashboardStats = {
    totalAssets: 0,
    activeBookings: 0,
    totalEarnings: 0,
    pendingReviews: 0,
  };
  activeBookings: Booking[] = [];
  reviews: Review[] = [];
  userId: string = localStorage.getItem('userId') || '';
  users: User[] = [];

  constructor(private ownerService: OwnerService, private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadActiveBookings();
    this.loadUsers();
    // this.loadReviews();
  }

  loadDashboardStats(): void {
    this.ownerService.getDashboardStats().subscribe({
      next: (data: DashboardStats) => {
        this.stats = data;
        console.log('Dashboard stats:', data);
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        alert('Failed to load dashboard stats');
      },
    });
  }

  loadUsers(): void {
    this.ownerService.getUsers().subscribe({
      next: (data) => {
        this.users = data.users;
      },
      error: (err) => {
        console.error('Error loading active bookings:', err);
      },
    });
  }

  loadActiveBookings(): void {
    this.ownerService.getActiveBookings().subscribe({
      next: (bookings: Booking[]) => {
        this.activeBookings = bookings;
        console.log('Active bookings:', bookings);
      },
      error: (err) => {
        console.error('Error loading active bookings:', err);
        alert('Failed to load active bookings');
      },
    });
  }

  // loadReviews(): void {
  //   this.ownerService.getOwnerReviews(this.userId).subscribe({
  //     next: (data: { reviews: Review[] }) => {
  //       this.reviews = data.reviews;
  //       console.log('Owner reviews:', data.reviews);
  //     },
  //     error: (err) => {
  //       console.error('Error loading reviews:', err);
  //       alert('Failed to load reviews');
  //     },
  //   });
  // }

  viewRenterProfile(renterId: string): void {
    this.router.navigate([`/renter/profile/${renterId}`]);
  }

  getStatsArray(): { title: string; value: number }[] {
    return [
      { title: 'Total Assets', value: this.stats.totalAssets },
      { title: 'Active Bookings', value: this.stats.activeBookings },
      { title: 'Total Earnings', value: this.stats.totalEarnings },
      { title: 'Pending Reviews', value: this.stats.pendingReviews },
    ];
  }

  onLogout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    this.router.navigate(['/auth/login']);
  }

  // Quick action navigation helpers
  goToAssets(): void {
    this.router.navigate(['/owner/assets']);
  }

  goToEarnings(): void {
    this.router.navigate(['/owner/wallet']);
  }

  goToReviews(): void {
    // Route to profile where reviews/overall account status are visible
    this.router.navigate(['/owner/profile']);
  }

  goToDisputes(): void {
    // For now, reuse rental requests page as the place to manage issues/disputes
    this.router.navigate(['/owner/rentals']);
  }

  onNavigate(event: Event): void {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      console.log('Navigating to:', path);
      this.router.navigate([path]);
    }
  }
}
