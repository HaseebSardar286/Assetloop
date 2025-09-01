import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header.component';
import { ProductItemComponent } from '../../../components/cards/product-item/product-item.component';
import { Bookings } from '../../../interfaces/bookings';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    RenterSideBarComponent,
    FormsModule,
    CommonModule,
    HeaderComponent,
    ProductItemComponent,
  ],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css'],
})
export class MyBookingsComponent {
  activeTab: keyof Bookings = 'upcoming';

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
        category: 'Apartment',
      },
      {
        id: 2,
        name: 'Spacious Suburban House',
        address: '456 Oak Ave, Suburbia',
        dates: '2025-08-15 to 2025-08-20',
        total: '$1250',
        status: 'pending',
        imageUrl: '/images/download.jpg',
        category: 'House',
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
    const booking = this.bookings.upcoming.find((b) => b.id === bookingId);
    if (booking) {
      this.bookings.upcoming = this.bookings.upcoming.filter(
        (b) => b.id !== bookingId
      );
      booking.status = 'cancelled';
      this.bookings.cancelled = [...this.bookings.cancelled, booking];
    }
  }

  viewListing(bookingId: number) {
    this.router.navigate([`/asset/${bookingId}`]);
  }

  logout() {
    this.router.navigate(['/auth/login']);
  }

  removeFavourite(id: number) {
    console.log(`Removed from favourites: ${id}`);
  }

  addToCart(id: number) {
    console.log(`Added to cart: ${id}`);
  }

  share(id: number) {
    console.log(`Sharing item ${id}`);
  }

  updateNotes(event: { id: number; notes: string }) {
    const booking = [
      ...this.bookings.upcoming,
      ...this.bookings.past,
      ...this.bookings.cancelled,
    ].find((b) => b.id === event.id);
    if (booking) booking.notes = event.notes;
  }
}
