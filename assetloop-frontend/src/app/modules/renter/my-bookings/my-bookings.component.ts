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
    currentDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
    
    // Ensure each booking has an id field (use _id if id is not present)
    const bookingsWithId = allBookings.map((booking) => ({
      ...booking,
      id: booking.id || booking._id || '',
    }));

    return {
      // Current bookings: confirmed, active, expiring soon, or overdue status
      // AND endDate is in the future (or null/undefined which means it hasn't ended)
      current: bookingsWithId.filter((b) => {
        const isCurrentStatus = 
          b.status === 'active' ||
          b.status === 'expiring soon' ||
          b.status === 'overdue' ||
          b.status === 'confirmed';
        
        if (!isCurrentStatus) return false;
        
        // If endDate exists, check if it's in the future
        if (b.endDate) {
          const endDate = new Date(b.endDate);
          endDate.setHours(0, 0, 0, 0);
          return endDate >= currentDate;
        }
        
        // If no endDate, include it if status is confirmed/active (booking hasn't ended yet)
        return b.status === 'confirmed' || b.status === 'active';
      }),
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
        console.log('Received bookings from API:', allBookings);
        console.log('Total bookings:', allBookings.length);
        console.log('Bookings by status:', {
          pending: allBookings.filter(b => b.status === 'pending').length,
          confirmed: allBookings.filter(b => b.status === 'confirmed').length,
          active: allBookings.filter(b => b.status === 'active').length,
          completed: allBookings.filter(b => b.status === 'completed').length,
          cancelled: allBookings.filter(b => b.status === 'cancelled').length,
        });
        this.bookings = this.partitionBookings(allBookings);
        console.log('Partitioned bookings:', {
          current: this.bookings.current.length,
          past: this.bookings.past.length,
          cancelled: this.bookings.cancelled.length,
          pending: this.bookings.pending.length,
        });
        console.log('Confirmed bookings in current:', this.bookings.current.filter(b => b.status === 'confirmed').length);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading bookings:', err);
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
        // Find booking in any category
        const allBookings = [
          ...this.bookings.current,
          ...this.bookings.past,
          ...this.bookings.pending,
        ];
        const booking = allBookings.find((b) => b.id === bookingId);
        
        if (booking) {
          // Remove from current category
          this.bookings.current = this.bookings.current.filter(
            (b) => b.id !== bookingId
          );
          this.bookings.past = this.bookings.past.filter(
            (b) => b.id !== bookingId
          );
          this.bookings.pending = this.bookings.pending.filter(
            (b) => b.id !== bookingId
          );
          
          // Add to cancelled
          booking.status = 'cancelled';
          this.bookings.cancelled = [...this.bookings.cancelled, booking];
        } else {
          // If booking not found locally, reload from server
          this.loadBookings();
        }
      },
      error: (err: any) => {
        console.error('Error cancelling booking:', err);
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
