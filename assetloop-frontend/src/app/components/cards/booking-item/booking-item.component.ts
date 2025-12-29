import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  faHeart,
  faShoppingCart,
  faShare,
  faTrash,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Booking, Bookings } from '../../../interfaces/bookings';
import { ChatService } from '../../../services/chat.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-booking-item',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './booking-item.component.html',
  styleUrls: ['./booking-item.component.css'],
})
export class BookingItemComponent {
  @Input() booking!: Booking;
  @Input() activeTab!: keyof Bookings;
  @Input() isFavourite: boolean = false;
  @Input() likedCount?: number;
  @Output() viewListing = new EventEmitter<string>();
  @Output() removeFavourite = new EventEmitter<string>();
  @Output() addToCart = new EventEmitter<string>();
  @Output() share = new EventEmitter<string>();
  @Output() cancelBooking = new EventEmitter<string>();
  @Output() leaveReview = new EventEmitter<string>();
  @Output() updateNotes = new EventEmitter<{ id: string; notes: string }>();

  faHeart = faHeart;
  faShoppingCart = faShoppingCart;
  faShare = faShare;
  faTrash = faTrash;
  faArrowRight = faArrowRight;
  constructor(
    private chatService: ChatService,
    private router: Router,
    private authService: AuthService
  ) {}

  onViewListing() {
    this.viewListing.emit(this.booking.id || this.booking._id);
  }

  onRemoveFavourite() {
    this.removeFavourite.emit(this.booking.id || this.booking._id);
  }

  onAddToCart() {
    this.addToCart.emit(this.booking.id || this.booking._id);
  }

  onShare() {
    this.share.emit(this.booking.id || this.booking._id);
  }

  onCancelBooking() {
    this.cancelBooking.emit(this.booking.id || this.booking._id);
  }

  onLeaveReview() {
    this.leaveReview.emit(this.booking.id || this.booking._id);
  }

  onNotesChange(event: Event) {
    const notes = (event.target as HTMLInputElement).value;
    this.updateNotes.emit({ id: this.booking.id || this.booking._id, notes });
  }

  startChatWithOwner(): void {
    // Ensure user is logged in
    if (!this.authService.isAuthenticated()) {
      alert('Please login to start a chat');
      return;
    }

    // Determine assetId and ownerId
    const assetId = (this.booking.asset && (this.booking.asset as any)._id) || this.booking._id || this.booking.id;
    const ownerId = (this.booking.owner && (this.booking.owner as any)._id) || (this.booking as any).owner?._id;

    if (!assetId || !ownerId) {
      alert('Missing asset or owner information for chat');
      return;
    }

    this.chatService.getOrCreateConversation(String(assetId), String(ownerId)).subscribe({
      next: (response) => {
        this.router.navigate(['/renter/chat'], {
          queryParams: { conversationId: response.conversation._id },
        });
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to start chat');
      },
    });
  }

  /**
   * Check if the booking's end date has passed
   * Handles different date formats and normalizes to start of day for comparison
   */
  isBookingPastEndDate(): boolean {
    if (!this.booking.endDate) {
      return false;
    }
    
    try {
      const endDate = new Date(this.booking.endDate);
      // Check if date is valid
      if (isNaN(endDate.getTime())) {
        console.warn('Invalid endDate for booking:', this.booking.id, this.booking.endDate);
        return false;
      }
      
      // Normalize to start of day for comparison (ignore time)
      endDate.setHours(0, 0, 0, 0);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      // Return true if end date is before or equal to today
      return endDate <= now;
    } catch (error) {
      console.error('Error checking end date:', error);
      return false;
    }
  }

  /**
   * Check if the booking can be reviewed
   * A booking can be reviewed if:
   * 1. It's completed, OR
   * 2. The end date has passed (regardless of status), AND
   * 3. No review has been submitted yet
   */
  isReviewable(): boolean {
    // Can't review if already reviewed
    if (this.booking.review) {
      console.log('Booking already reviewed:', this.booking.id);
      return false;
    }
    
    // Can review if status is completed
    if (this.booking.status === 'completed') {
      console.log('Booking is completed, can review:', this.booking.id);
      return true;
    }
    
    // Can review if end date has passed (for any status)
    const isPastEndDate = this.isBookingPastEndDate();
    if (isPastEndDate) {
      console.log('Booking end date has passed, can review:', this.booking.id, 'Status:', this.booking.status);
    } else {
      console.log('Booking end date has not passed yet:', this.booking.id, 'End Date:', this.booking.endDate, 'Status:', this.booking.status);
    }
    return isPastEndDate;
  }
}
