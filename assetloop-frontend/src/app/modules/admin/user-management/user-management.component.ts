import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../interfaces/user';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, AdminSidebarComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getUsers().subscribe({
      next: (data) => {
        console.log('Raw API Response:', data);
        if (data && Array.isArray(data.users)) {
          this.users = data.users;
        } else {
          console.warn('Unexpected API response format:', data);
          this.users = [];
        }
        this.loading = false;
        if (this.users.length === 0 && !this.error) {
          this.error = 'No users found in the database';
        }
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.error = err.error?.message || 'Failed to load users';
        this.loading = false;
      },
    });
  }

  onLogout(): void {
    localStorage.removeItem('authToken');
    window.location.href = '/auth/login';
  }

  deleteUser(userId: any): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter((u) => u._id !== userId);
          console.log(`User ${userId} deleted`);
          if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages || 1;
          }
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          this.error = err.error?.message || 'Failed to delete user';
        },
      });
    }
  }

  // Pagination methods
  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.users.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.users.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
