import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-transaction-management',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, AdminSidebarComponent],
  templateUrl: './transaction-management.component.html',
  styleUrls: ['./transaction-management.component.css'],
})
export class TransactionManagementComponent {
  transactions = [
    {
      id: 1,
      user: 'Ahmed Hassan',
      listing: 'Toyota Camry',
      amount: 5000,
      date: '2025-09-01 14:30',
      status: 'Completed',
      isConfirmed: false,
    },
    {
      id: 2,
      user: 'Sara Ahmed',
      listing: 'Apartment 2B',
      amount: 8000,
      date: '2025-09-01 09:45',
      status: 'Pending',
      isConfirmed: true,
    },
    {
      id: 3,
      user: 'Omar Farooq',
      listing: 'House 3C',
      amount: 12000,
      date: '2025-08-31 16:20',
      status: 'Failed',
      isConfirmed: true,
    },
  ];

  isConfirmed: boolean = false;

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

  confirmTransaction(transaction: any) {
    // You can also call API here
    transaction.isConfirmed = true;
  }

  cancelTransaction(transaction: any) {
    // cancel logic
    transaction.isConfirmed = false;
  }

  markCompleted(transaction: any) {
    // mark as completed logic
    console.log('Transaction completed:', transaction.id);
  }
}
