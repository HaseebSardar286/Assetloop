import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Booking, Bookings } from '../../../interfaces/bookings';
import { OwnerService } from '../../../services/owner.service';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';
import { RentalRequestItemsComponent } from '../../../components/cards/rental-request-items/rental-request-items.component';

@Component({
  selector: 'app-rental-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    OwnerSideBarComponent,
    RentalRequestItemsComponent,
  ],
  templateUrl: './rental-requests.component.html',
  styleUrls: ['./rental-requests.component.css'],
})
export class RentalRequestsComponent implements OnInit {
  bookings: Bookings = { current: [], past: [], cancelled: [], pending: [] };
  loading = false;
  error: string | null = null;

  constructor(private ownerService: OwnerService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  onLogout() {
    // Handle logout (e.g., clear token, redirect to login)
  }

  loadBookings(): void {
    this.loading = true;
    this.error = null;
    console.log(
      'Loading bookings at:',
      new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })
    );
    this.ownerService.getBookings().subscribe({
      next: (allBookings: Booking[]) => {
        console.log('Received bookings:', allBookings);
        this.bookings = this.partitionBookings(allBookings);
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to load bookings';
        console.error('Error loading bookings:', err);
        this.loading = false;
      },
    });
  }

  private partitionBookings(allBookings: Booking[]): Bookings {
    const currentDate = new Date(); // 2025-09-17 17:59 PKT
    console.log('Partitioning bookings with current date:', currentDate);
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

  onNavigate(event: Event) {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      console.log('Navigating to:', path);
    }
  }

  onStatusUpdate(event: {
    bookingId: string;
    newStatus: 'confirmed' | 'cancelled';
  }) {
    console.log('Handling status update:', event);
    this.ownerService.updateStatus(event.bookingId, event.newStatus).subscribe({
      next: (updatedBooking: Booking) => {
        console.log('Status updated successfully:', updatedBooking);
        this.loadBookings(); // Refresh bookings
      },
      error: (err: any) => {
        // UPDATED: Detailed error logging
        const errorMessage =
          err?.error?.message || 'Failed to update booking status';
        this.error = errorMessage;
        console.error('Status update error:', {
          status: err.status,
          message: errorMessage,
          details: err,
        });
      },
    });
  }
}
