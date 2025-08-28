import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header.component';
// Define the Booking interface
interface Booking {
  id: number;
  name: string;
  address: string;
  dates: string;
  total: string;
  status: string;
  imageUrl?: string;
}

// Define the Bookings interface
interface Bookings {
  upcoming: Booking[];
  past: Booking[];
  cancelled: Booking[];
}

@Component({
  selector: 'app-my-bookings',
  imports: [RenterSideBarComponent, FormsModule, CommonModule, HeaderComponent],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.css',
})
export class MyBookingsComponent {
  activeTab: keyof Bookings = 'upcoming'; // Restrict activeTab to the keys of Bookings

  bookings: Bookings = {
    upcoming: [
      {
        id: 1,
        name: 'Cozy Downtown Apartment',
        address: '123 Main St, Cityville',
        dates: '2025-07-05 to 2025-07-10',
        total: '$750',
        status: 'confirmed',
        imageUrl: '/images/download.jpg',
      },
      {
        id: 2,
        name: 'Spacious Suburban House',
        address: '456 Oak Ave, Suburbia',
        dates: '2025-08-15 to 2025-08-20',
        total: '$1250',
        status: 'pending',
        imageUrl: '/images/download.jpg',
      },
    ],
    past: [],
    cancelled: [],
  };

  constructor(private router: Router) {}

  setActiveTab(tab: keyof Bookings) {
    this.activeTab = tab;
  }

  cancelBooking(bookingId: number) {
    console.log(`Cancelled booking with ID: ${bookingId}`);
    // Add cancellation logic here
  }

  viewListing(bookingId: number) {
    this.router.navigate([`/asset/${bookingId}`]);
  }

  logout() {
    this.router.navigate(['/auth/login']);
  }
}
