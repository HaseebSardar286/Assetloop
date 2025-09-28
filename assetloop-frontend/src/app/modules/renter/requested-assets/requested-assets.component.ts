import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { NgFor, NgIf } from '@angular/common';
import { BookingItemComponent } from '../../../components/cards/booking-item/booking-item.component';
import { Booking, Bookings } from '../../../interfaces/bookings';
import { Router } from '@angular/router';
import { RenterService } from '../../../services/renter.service';

@Component({
  selector: 'app-requested-assets',
  imports: [
    HeaderComponent,
    RenterSideBarComponent,
    NgFor,
    NgIf,
    BookingItemComponent,
  ],
  templateUrl: './requested-assets.component.html',
  styleUrl: './requested-assets.component.css',
})
export class RequestedAssetsComponent {
  activeTab: keyof Bookings = 'pending';
  bookings: Bookings = { current: [], past: [], cancelled: [], pending: [] };
  loading = false;
  error: string | null = null;

  requests: any[] = [];

  constructor(private router: Router, private renterService: RenterService) {}

  ngOnInit(): void {
    this.loadBookings();
    // this.fetchRequests();
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

  viewListing(bookingId: string) {
    this.router.navigate([`/asset/${bookingId}`]);
  }

  leaveReview(bookingId: string) {
    this.router.navigate([`/renter/review/${bookingId}`]);
  }

  onLogout() {
    this.router.navigate(['/auth/login']);
  }

  share(id: string) {
    console.log(`Sharing item ${id}`);
  }

  onNavigate(event: Event) {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      console.log('Navigating to:', path);
    }
  }
}
