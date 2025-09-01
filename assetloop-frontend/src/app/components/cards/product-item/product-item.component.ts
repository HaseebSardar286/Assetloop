import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Booking, Bookings } from '../../../interfaces/bookings';
import {
  faHeart,
  faShoppingCart,
  faShare,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.css'],
})
export class ProductItemComponent {
  @Input() booking!: Booking;
  @Input() activeTab!: keyof Bookings;
  @Input() isFavourite: boolean = false;
  @Input() likedCount?: number;
  @Output() viewListing = new EventEmitter<number>();
  @Output() removeFavourite = new EventEmitter<number>();
  @Output() addToCart = new EventEmitter<number>();
  @Output() share = new EventEmitter<number>();
  @Output() cancelBooking = new EventEmitter<number>(); // Ensure this is defined
  @Output() updateNotes = new EventEmitter<{ id: number; notes: string }>();

  faHeart = faHeart;
  faShoppingCart = faShoppingCart;
  faShare = faShare;
  faTrash = faTrash;

  onViewListing() {
    this.viewListing.emit(this.booking.id);
  }

  onRemoveFavourite() {
    this.removeFavourite.emit(this.booking.id);
  }

  onAddToCart() {
    this.addToCart.emit(this.booking.id);
  }

  onShare() {
    this.share.emit(this.booking.id);
  }

  onCancelBooking() {
    this.cancelBooking.emit(this.booking.id); // Emit the booking ID
  }

  onNotesChange(event: Event) {
    const notes = (event.target as HTMLInputElement).value;
    this.updateNotes.emit({ id: this.booking.id, notes });
  }
}
