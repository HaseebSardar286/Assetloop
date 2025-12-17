import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminService } from '../../../services/admin.service';
import { AdminMetrics } from '../../../interfaces/admin';
import { Booking } from '../../../interfaces/bookings';
import { User } from '../../../interfaces/user';
import { AssetResponse } from '../../../interfaces/asset';
import { Review } from '../../../interfaces/review';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUsers,
  faBox,
  faComments,
  faClipboardList,
  faArrowLeft,
  faArrowRight,
  faEye,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    AdminSidebarComponent,
    FontAwesomeModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  faUsers = faUsers;
  faBox = faBox;
  faComments = faComments;
  faClipboardList = faClipboardList;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  faEye = faEye;
  faTrash = faTrash;
  deleteReview(arg0: string) {
    throw new Error('Method not implemented.');
  }
  metrics: AdminMetrics = {
    totalUsers: 0,
    totalAssets: 0,
    pendingRequests: 0,
    totalBookings: 0,
    totalReviews: 0,
    usersByRole: [],
    bookingsByStatus: [],
  };
  bookings: Booking[] = [];
  reviews: Review[] = [];
  users: User[] = [];
  assets: AssetResponse[] = [];
  adminName: string = 'Admin';
  loading = true;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getAdminMetrics().subscribe({
      next: (data: AdminMetrics) => {
        this.metrics = data;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load metrics';
      },
    });

    this.adminService.getAllBookings().subscribe({
      next: (data) => {
        this.bookings = data.bookings;
      },
      error: (err) => {
        this.error =
          this.error || err.error?.message || 'Failed to load bookings';
      },
    });

    this.adminService.getAllReviews().subscribe({
      next: (data) => {
        this.reviews = data.reviews;
      },
      error: (err) => {
        this.error =
          this.error || err.error?.message || 'Failed to load reviews';
      },
    });

    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data.users;
      },
      error: (err) => {
        this.error = this.error || err.error?.message || 'Failed to load users';
      },
    });

    this.adminService.getAssets().subscribe({
      next: (data) => {
        this.assets = data.assets;
        this.loading = false;
      },
      error: (err) => {
        this.error =
          this.error || err.error?.message || 'Failed to load assets';
        this.loading = false;
      },
    });
  }

  onLogout(): void {
    localStorage.removeItem('authToken');
    window.location.href = '/auth/login';
  }

  onNavigate(event: Event): void {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      console.log('Navigating to:', path);
    }
  }

  // Pagination methods
  get paginatedBookings(): Booking[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.bookings.slice(start, end);
  }

  get paginatedReviews(): Review[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.reviews.slice(start, end);
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.users.slice(start, end);
  }

  get paginatedAssets(): AssetResponse[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.assets.slice(start, end);
  }

  get totalPagesBookings(): number {
    return Math.ceil(this.bookings.length / this.itemsPerPage);
  }

  get totalPagesReviews(): number {
    return Math.ceil(this.reviews.length / this.itemsPerPage);
  }

  get totalPagesUsers(): number {
    return Math.ceil(this.users.length / this.itemsPerPage);
  }

  get totalPagesAssets(): number {
    return Math.ceil(this.assets.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPagesAssets) {
      // Use the highest page count as a reference
      this.currentPage = page;
    }
  }

  filterRecentUsers(users: User[]): User[] {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return users.filter((user) => {
      if (!user.createdAt) return false;
      const createdAtDate = new Date(user.createdAt);
      return createdAtDate >= thirtyDaysAgo;
    });
  }
}
