import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';
import { HttpClient } from '@angular/common/http';
import { Booking, Bookings } from '../../../interfaces/bookings';
import { OwnerService } from '../../../services/owner.service';
import { RentalRequestItemsComponent } from '../../../components/cards/rental-request-items/rental-request-items.component';
import { RenterService } from '../../../services/renter.service';
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
export class RentalRequestsComponent {
  bookings: Bookings = { current: [], past: [], cancelled: [], pending: [] };
  loading = false;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private renterService: RenterService,
    private ownerService: OwnerService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  onLogout() {
    // Handle logout
  }

  loadBookings(): void {
    this.loading = true;
    this.error = null;
    this.ownerService.getBookings().subscribe({
      next: (allBookings: Booking[]) => {
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
          new Date(b.endDate) > currentDate
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
    this.ownerService.updateStatus(event.bookingId, event.newStatus).subscribe({
      next: () => {
        this.loadBookings(); // Refresh bookings after status update
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to update booking status';
      },
    });
  }
}
