import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Booking, Bookings } from '../../../interfaces/bookings';
import { OwnerService } from '../../../services/owner.service';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';
import { RentalRequestItemsComponent } from '../../../components/cards/rental-request-items/rental-request-items.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faInbox,
  faClockRotateLeft,
  faCheck,
  faXmark,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-rental-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    OwnerSideBarComponent,
    RentalRequestItemsComponent,
    FontAwesomeModule,
  ],
  templateUrl: './rental-requests.component.html',
  styleUrls: ['./rental-requests.component.css'],
})
export class RentalRequestsComponent implements OnInit {
  bookings: Bookings = { current: [], past: [], cancelled: [], pending: [] };
  loading = false;
  error: string | null = null;

  constructor(
    private ownerService: OwnerService,
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

  faInbox = faInbox;
  faClockRotateLeft = faClockRotateLeft;
  faCheck = faCheck;
  faXmark = faXmark;
  faArrowRight = faArrowRight;

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

  startChatWithRenter(booking: Booking): void {
    if (!booking.renter || !booking.asset) {
      alert('Renter or asset information not available');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Please login to start a chat');
      return;
    }

    // Get or create conversation with the renter for this asset
    this.chatService.getOrCreateConversation(booking.asset._id, booking.renter._id).subscribe({
      next: (response) => {
        // Navigate to chat with the conversation ID
        this.router.navigate(['/owner/chat'], { 
          queryParams: { conversationId: response.conversation._id } 
        });
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to start chat');
      }
    });
  }
}
