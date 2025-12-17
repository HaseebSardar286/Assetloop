import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../interfaces/user';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash, faEye, faSearch, faTimes, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderComponent,
    AdminSidebarComponent,
    FontAwesomeModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  faTrash = faTrash;
  faEye = faEye;
  faSearch = faSearch;
  faTimes = faTimes;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;

  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  error: string | null = null;
  searchTerm: string = '';
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
        this.users = Array.isArray(data.users)
          ? data.users
          : Array.isArray(data)
          ? data
          : [];
        this.filteredUsers = this.users;
        this.loading = false;
        if (this.users.length === 0 && !this.error) {
          this.error = 'No users found in the database';
        }
        this.updatePagination();
        console.log('Loaded users:', this.users);
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.error = err.error?.message || 'Failed to load users';
        this.loading = false;
      },
    });
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
    console.log('Search cleared, showing all users:', this.filteredUsers);
  }

  deleteUser(userId: any): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter((u) => u._id !== userId);
          this.searchUsers(); // Reapply search and pagination
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

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  set paginatedUsers(value: User[]) {
    // Setter required for Angular to update paginatedUsers
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
    window.location.href = '/auth/login';
  }
}
