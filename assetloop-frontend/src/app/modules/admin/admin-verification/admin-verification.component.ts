import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../interfaces/user';

@Component({
  selector: 'app-admin-verification',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderComponent,
    AdminSidebarComponent,
  ],
  templateUrl: './admin-verification.component.html',
  styleUrls: ['./admin-verification.component.css'],
})
export class AdminVerificationComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  loading = true;
  error: string | null = null;
  searchTerm: string = '';
  currentPage = 1;
  itemsPerPage = 10;

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.loadPendingUsers();
  }

  loadPendingUsers(): void {
    this.loading = true;
    this.error = null;

    // this.adminService.getPendingUsers().subscribe({
    //   next: (data: User[]) => {
    //     console.log('Raw API Response:', data);
    //     this.users = Array.isArray(data) ? data : [];
    //     this.filteredUsers = this.users;
    //     this.loading = false;
    //     if (this.users.length === 0 && !this.error) {
    //       this.error = 'No pending users found';
    //     }
    //     this.updatePagination();
    //     console.log('Loaded pending users:', this.users);
    //   },
    //   error: (err: { error: { message: string; }; }) => {
    //     console.error('Error fetching pending users:', err);
    //     this.error = err.error?.message || 'Failed to load pending users';
    //     this.loading = false;
    //   },
    // });
  }

  searchUsers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    console.log('Search term:', term);
    if (!term) {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter((user) => {
        const fullName = [
          user.firstName || '',
          user.middleName || '',
          user.lastName || '',
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .trim();
        return (
          fullName.includes(term) ||
          (user.email && user.email.toLowerCase().includes(term)) ||
          (user.role && user.role.toLowerCase().includes(term))
        );
      });
    }
    console.log('Filtered users:', this.filteredUsers);
    this.currentPage = 1;
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredUsers = this.users;
    this.currentPage = 1;
    this.updatePagination();
    console.log(
      'Search cleared, showing all pending users:',
      this.filteredUsers
    );
  }

  approveUser(userId: any): void {
    if (confirm('Are you sure you want to approve this user?')) {
      // this.adminService.approveUser(userId).subscribe({
      //   next: () => {
      //     this.users = this.users.filter((u) => u._id !== userId);
      //     this.searchUsers();
      //     console.log(`User ${userId} approved`);
      //   },
      //   error: (err: { error: { message: string; }; }) => {
      //     console.error('Error approving user:', err);
      //     this.error = err.error?.message || 'Failed to approve user';
      //   },
      // });
    }
  }

  rejectUser(userId: any): void {
    if (confirm('Are you sure you want to reject this user?')) {
      // this.adminService.rejectUser(userId).subscribe({
      //   next: () => {
      //     this.users = this.users.filter((u) => u._id !== userId);
      //     this.searchUsers();
      //     console.log(`User ${userId} rejected`);
      //   },
      //   error: (err: { error: { message: string; }; }) => {
      //     console.error('Error rejecting user:', err);
      //     this.error = err.error?.message || 'Failed to reject user';
      //   },
      // });
    }
  }

  deleteUser(userId: any): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter((u) => u._id !== userId);
          this.searchUsers();
          console.log(`User ${userId} deleted`);
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          this.error = err.error?.message || 'Failed to delete user';
        },
      });
    }
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  onLogout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    this.router.navigate(['/auth/login']);
  }
}
