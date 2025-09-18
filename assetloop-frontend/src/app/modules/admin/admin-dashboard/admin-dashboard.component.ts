import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminService } from '../../../services/admin.service';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface Asset {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

interface Request {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  imageUrl?: string;
}

interface AdminMetrics {
  totalUsers: number;
  totalAssets: number;
  pendingRequests: number;
  totalBookings: number;
  totalEarnings: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, AdminSidebarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  metrics: AdminMetrics = {
    totalUsers: 0,
    totalAssets: 0,
    pendingRequests: 0,
    totalBookings: 0,
    totalEarnings: 0,
  };
  users: User[] = [];
  assets: Asset[] = [];
  requests: Request[] = [];
  adminName: string = 'Admin'; // Replace with dynamic value from auth
  loading = true;
  error: string | null = null;

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

    //   this.adminService.getRecentUsers().subscribe({
    //     next: (data: User[]) => {
    //       this.users = data;
    //     },
    //     error: (err) => {
    //       this.error = this.error || (err.error?.message || 'Failed to load users');
    //     },
    //   });

    //   this.adminService.getRecentAssets().subscribe({
    //     next: (data: Asset[]) => {
    //       this.assets = data;
    //     },
    //     error: (err) => {
    //       this.error = this.error || (err.error?.message || 'Failed to load assets');
    //     },
    //   });

    //   this.adminService.getPendingRequests().subscribe({
    //     next: (data: Request[]) => {
    //       this.requests = data;
    //       this.loading = false;
    //     },
    //     error: (err) => {
    //       this.error = this.error || (err.error?.message || 'Failed to load requests');
    //       this.loading = false;
    //     },
    //   });
    // }

    // onLogout(): void {
    //   localStorage.removeItem('authToken');
    //   // Navigate to login page (assuming Router is injected)
    //   window.location.href = '/auth/login'; // Replace with router.navigate if available
    // }

    // viewUserDetails(userId: string): void {
    //   // Navigate to user details page
    // }

    // viewAssetDetails(assetId: string): void {
    //   // Navigate to asset details page
    // }

    // viewRequestDetails(requestId: string): void {
    //   // Navigate to request details page
    // }
  }
}
