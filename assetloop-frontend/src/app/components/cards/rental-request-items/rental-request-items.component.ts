import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Booking } from '../../../interfaces/bookings';

@Component({
  selector: 'app-rental-request-items',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rental-request-items.component.html',
  styleUrls: ['./rental-request-items.component.css'],
})
export class RentalRequestItemsComponent {
  @Input() booking!: Booking;
  @Output() statusUpdate = new EventEmitter<{
    bookingId: string;
    newStatus: 'confirmed' | 'cancelled';
  }>();
  @Output() startChat = new EventEmitter<Booking>();

  updateStatus(bookingId: string, newStatus: 'confirmed' | 'cancelled') {
    console.log(
      'Emitting status update for booking:',
      bookingId,
      'to',
      newStatus
    );
    this.statusUpdate.emit({ bookingId, newStatus });
  }

  onStartChat() {
    this.startChat.emit(this.booking);
  }
}
