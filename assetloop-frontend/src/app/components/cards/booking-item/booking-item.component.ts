import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  faHeart,
  faShoppingCart,
  faShare,
  faTrash,
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
}
