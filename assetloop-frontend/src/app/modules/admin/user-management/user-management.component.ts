import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, AdminSidebarComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent {
  users = [
    {
      id: 1,
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@example.com',
      role: 'Owner',
    },
    {
      id: 2,
      name: 'Sara Ahmed',
      email: 'sara.ahmed@example.com',
      role: 'Renter',
    },
    {
      id: 3,
      name: 'Omar Farooq',
      email: 'omar.farooq@example.com',
      role: 'Admin',
    },
  ];

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

  deleteUser(userId: number) {
    this.users = this.users.filter((u) => u.id !== userId);
    console.log(`User ${userId} deleted`);
  }
}
