import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header.component';
import { Bookings, Booking } from '../../../interfaces/bookings';
import { BookingItemComponent } from '../../../components/cards/booking-item/booking-item.component';
import { RenterService } from '../../../services/renter.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    RenterSideBarComponent,
    FormsModule,
    CommonModule,
    HeaderComponent,
    BookingItemComponent,
  ],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css'],
})
export class MyBookingsComponent implements OnInit {
  activeTab: keyof Bookings = 'current';

  bookings: Bookings = { current: [], past: [], cancelled: [], pending: [] };
  loading = false;
  error: string | null = null;

  constructor(private router: Router, private renterService: RenterService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  private partitionBookings(allBookings: Booking[]): Bookings {
    const currentDate = new Date();
    // Ensure each booking has an id field (use _id if id is not present)
    const bookingsWithId = allBookings.map((booking) => ({
      ...booking,
      id: booking.id || booking._id || '',
    }));

    return {
      current: bookingsWithId.filter(
        (b) =>
          (b.status === 'active' ||
            b.status === 'expiring soon' ||
            b.status === 'overdue' ||
            b.status === 'confirmed') &&
          new Date(b.endDate || currentDate) > currentDate
      ),
      past: bookingsWithId.filter((b) => b.status === 'completed'),
      cancelled: bookingsWithId.filter((b) => b.status === 'cancelled'),
      pending: bookingsWithId.filter((b) => b.status === 'pending'),
    };
  }

  loadBookings(): void {
    this.loading = true;
    this.error = null;
    this.renterService.getBookings().subscribe({
      next: (allBookings) => {
        this.bookings = this.partitionBookings(allBookings);
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to load bookings';
        this.loading = false;
      },
    });
  }

  setActiveTab(tab: keyof Bookings) {
    this.activeTab = tab;
  }

  cancelBooking(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    this.renterService.cancelBooking(bookingId).subscribe({
      next: () => {
        const booking = this.bookings.current.find((b) => b.id === bookingId);
        if (booking) {
          this.bookings.current = this.bookings.current.filter(
            (b) => b.id !== bookingId
          );
          booking.status = 'cancelled';
          this.bookings.cancelled = [...this.bookings.cancelled, booking];
        }
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to cancel booking';
      },
    });
  }

  viewListing(bookingId: string) {
    this.router.navigate([`/asset/${bookingId}`]);
  }

  leaveReview(bookingId: string) {
    this.router.navigate([`/renter/review/${bookingId}`]);
  }

  logout() {
    this.router.navigate(['/auth/login']);
  }

  removeFavourite(id: string) {
    console.log(`Removed from favourites: ${id}`);
  }

  addToCart(id: string) {
    console.log(`Added to cart: ${id}`);
  }

  share(id: string) {
    console.log(`Sharing item ${id}`);
  }

  updateNotes(event: { id: string; notes: string }) {
    const booking = [
      ...this.bookings.current,
      ...this.bookings.past,
      ...this.bookings.cancelled,
    ].find((b) => b.id === event.id);
    if (booking) booking.notes = event.notes;
  }
}
