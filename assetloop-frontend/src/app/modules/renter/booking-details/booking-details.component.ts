import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { RenterService } from '../../../services/renter.service';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCalendar,
  faMapMarkerAlt,
  faUser,
  faComments,
  faArrowLeft,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faBan,
} from '@fortawesome/free-solid-svg-icons';
import { SystemCurrencyPipe } from '../../../pipes/currency.pipe';
import { Booking } from '../../../interfaces/bookings';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    RenterSideBarComponent,
    FontAwesomeModule,
    SystemCurrencyPipe,
  ],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.css',
})
export class BookingDetailsComponent implements OnInit {
  faCalendar = faCalendar;
  faMapMarkerAlt = faMapMarkerAlt;
  faUser = faUser;
  faComments = faComments;
  faArrowLeft = faArrowLeft;
  faCheckCircle = faCheckCircle;
  faClock = faClock;
  faTimesCircle = faTimesCircle;
  faBan = faBan;

  bookingId: string | null = null;
  loading = false;
  error: string | null = null;
  booking: Booking | null = null;

  constructor(
    private route: ActivatedRoute,
    private renterService: RenterService,
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id');
    if (this.bookingId) {
      this.loadBooking();
    } else {
      this.error = 'Booking ID not provided';
    }
  }

  loadBooking(): void {
    if (!this.bookingId) return;
    
    this.loading = true;
    this.error = null;
    
    this.renterService.getBookingDetails(this.bookingId).subscribe({
      next: (booking: any) => {
        this.booking = booking;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to load booking details';
        this.loading = false;
      },
    });
  }

  getStatusClass(): string {
    if (!this.booking) return '';
    
    switch (this.booking.status) {
      case 'confirmed':
      case 'active':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'completed':
        return 'bg-primary';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusIcon(): any {
    if (!this.booking) return faClock;
    
    switch (this.booking.status) {
      case 'confirmed':
      case 'active':
      case 'completed':
        return faCheckCircle;
      case 'cancelled':
        return faTimesCircle;
      case 'pending':
        return faClock;
      default:
        return faClock;
    }
  }

  calculateDays(): number {
    if (!this.booking || !this.booking.startDate || !this.booking.endDate) {
      return 0;
    }
    const start = new Date(this.booking.startDate);
    const end = new Date(this.booking.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }

  calculateTotal(): number {
    if (!this.booking) return 0;
    return this.booking.totalPaid || (this.booking.price * this.calculateDays());
  }

  startChat(): void {
    if (!this.booking || !this.booking.owner) {
      alert('Owner information not available');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Please login to start a chat');
      return;
    }

    const assetId = this.booking.asset?._id || this.booking.asset;
    const ownerId = (this.booking.owner as any)._id || this.booking.owner;

    if (!assetId || !ownerId) {
      alert('Missing information for chat');
      return;
    }

    this.chatService.getOrCreateConversation(String(assetId), String(ownerId)).subscribe({
      next: (response) => {
        this.router.navigate(['/renter/chat'], {
          queryParams: { conversationId: response.conversation._id },
        });
      },
      error: (err) => {
        console.error('Chat error:', err);
        alert(err?.error?.message || 'Failed to start chat');
      },
    });
  }

  viewAssetDetails(): void {
    if (!this.booking || !this.booking.asset) {
      alert('Asset information not available');
      return;
    }
    
    const assetId = (this.booking.asset as any)._id || this.booking.asset;
    if (assetId) {
      this.router.navigate([`/renter/asset/${assetId}`]);
    }
  }

  cancelBooking(): void {
    if (!this.booking || !this.bookingId) return;
    
    if (this.booking.status === 'cancelled') {
      alert('This booking is already cancelled');
      return;
    }
    
    if (this.booking.status !== 'pending') {
      alert('Only pending bookings can be cancelled');
      return;
    }
    
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    this.loading = true;
    this.renterService.cancelBooking(this.bookingId).subscribe({
      next: () => {
        this.loading = false;
        alert('Booking cancelled successfully');
        this.loadBooking(); // Reload to update status
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to cancel booking';
      },
    });
  }

  leaveReview(): void {
    if (!this.bookingId) return;
    this.router.navigate([`/renter/review/${this.bookingId}`]);
  }

  isReviewable(): boolean {
    if (!this.booking) return false;
    
    // Can't review if already reviewed
    if (this.booking.review) return false;
    
    // Can review if status is completed
    if (this.booking.status === 'completed') return true;
    
    // Can review if end date has passed
    if (this.booking.endDate) {
      const endDate = new Date(this.booking.endDate);
      endDate.setHours(0, 0, 0, 0);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return endDate <= now;
    }
    
    return false;
  }

  getOwnerName(): string {
    if (!this.booking || !this.booking.owner) return 'Owner information not available';
    const owner = this.booking.owner as any;
    return owner.name || owner.firstName || 'Owner information not available';
  }

  getOwnerEmail(): string | null {
    if (!this.booking || !this.booking.owner) return null;
    const owner = this.booking.owner as any;
    return owner.email || null;
  }

  getAssetAmenities(): string[] {
    if (!this.booking || !this.booking.asset) return [];
    const asset = this.booking.asset as any;
    return asset.amenities || [];
  }

  hasAssetAmenities(): boolean {
    return this.getAssetAmenities().length > 0;
  }

  goBack(): void {
    this.router.navigate(['/renter/booking-history']);
  }

  onLogout(): void {
    this.authService.logout();
  }
}

