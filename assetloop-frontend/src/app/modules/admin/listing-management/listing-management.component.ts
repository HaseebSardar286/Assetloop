import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-listing-management',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, AdminSidebarComponent],
  templateUrl: './listing-management.component.html',
  styleUrls: ['./listing-management.component.css'],
})
export class ListingManagementComponent {
  listings = [
    {
      id: 1,
      name: 'Toyota Camry',
      owner: 'Ahmed Hassan',
      status: 'active',
      price: 5000,
    },
    {
      id: 2,
      name: 'Apartment 2B',
      owner: 'Sara Ahmed',
      status: 'inactive',
      price: 8000,
    },
    {
      id: 3,
      name: 'House 3C',
      owner: 'Omar Farooq',
      status: 'active',
      price: 12000,
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

  deleteListing(listingId: number) {
    this.listings = this.listings.filter((l) => l.id !== listingId);
    console.log(`Listing ${listingId} deleted`);
  }
}
