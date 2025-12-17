import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminService } from '../../../services/admin.service';
import { SystemSettingsService } from '../../../services/system-settings.service';
import { SystemCurrencyPipe } from '../../../pipes/currency.pipe';
import { Transaction } from '../../../interfaces/payments';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheck,
  faTimes,
  faCheckCircle,
  faArrowLeft,
  faArrowRight,
  faSearch,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';

interface TransactionWithUser extends Transaction {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  booking?: {
    id: string;
    name: string;
    asset?: string;
  } | null;
}

@Component({
  selector: 'app-transaction-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderComponent,
    AdminSidebarComponent,
    FontAwesomeModule,
    SystemCurrencyPipe,
  ],
  templateUrl: './transaction-management.component.html',
  styleUrls: ['./transaction-management.component.css'],
})
export class TransactionManagementComponent implements OnInit {
  faCheck = faCheck;
  faTimes = faTimes;
  faCheckCircle = faCheckCircle;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  faSearch = faSearch;
  faFilter = faFilter;

  transactions: TransactionWithUser[] = [];
  loading = false;
  error: string | null = null;

  // Filters
  filterStatus: string = '';
  filterType: string = '';
  searchQuery: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalTransactions: number = 0;

  // Status options
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Type options
  typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'payment', label: 'Payment' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'refund', label: 'Refund' },
    { value: 'payout', label: 'Payout' },
  ];

  constructor(
    private adminService: AdminService,
    private systemSettingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = null;

    this.adminService
      .getAllTransactions({
        status: this.filterStatus || undefined,
        type: this.filterType || undefined,
        search: this.searchQuery || undefined,
        page: this.currentPage,
        limit: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          this.transactions = response.transactions.map((t: any) => ({
            ...t,
            user: t.user || { id: '', name: 'Unknown User', email: '' },
            booking: t.booking || null,
          }));
          this.totalTransactions = response.total;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to load transactions';
          this.loading = false;
        },
      });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterType = '';
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadTransactions();
  }

  updateTransactionStatus(transaction: TransactionWithUser, newStatus: string): void {
    if (!transaction.id) return;

    const oldStatus = transaction.status || 'pending';
    // Optimistic update
    if (transaction.status) {
      transaction.status = newStatus as Transaction['status'];
    }

    this.adminService.updateTransactionStatus(transaction.id.toString(), newStatus).subscribe({
      next: (response) => {
        // Update with server response
        const index = this.transactions.findIndex((t) => t.id === transaction.id);
        if (index !== -1) {
          this.transactions[index] = response.transaction as TransactionWithUser;
        }
      },
      error: (err) => {
        // Revert on error
        if (transaction.status) {
          transaction.status = oldStatus as Transaction['status'];
        }
        alert(err.error?.message || 'Failed to update transaction status');
      },
    });
  }

  confirmTransaction(transaction: TransactionWithUser): void {
    this.updateTransactionStatus(transaction, 'completed');
  }

  cancelTransaction(transaction: TransactionWithUser): void {
    this.updateTransactionStatus(transaction, 'cancelled');
  }

  markFailed(transaction: TransactionWithUser): void {
    this.updateTransactionStatus(transaction, 'failed');
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTransactions();
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'failed':
        return 'bg-danger';
      case 'cancelled':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  formatDate(date: string | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  }

  // Expose Math to template
  Math = Math;

  // Type guard to ensure transaction has required properties
  hasTransactionId(t: TransactionWithUser): t is TransactionWithUser & { id: string | number } {
    return !!t.id;
  }

  onLogout(): void {
    localStorage.removeItem('authToken');
    window.location.href = '/auth/login';
  }
}
