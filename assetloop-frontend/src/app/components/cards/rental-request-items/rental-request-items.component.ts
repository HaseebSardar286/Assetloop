import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Booking } from '../../../interfaces/bookings';
import { getRenterName } from '../../../utils/type-guards';

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

  // Helper function for template
  getRenterName = getRenterName;

  updateStatus(bookingId: string, newStatus: 'confirmed' | 'cancelled') {
    console.log(
      'Emitting status update for booking:',
      bookingId,
      'to',
      newStatus
    );
    this.statusUpdate.emit({ bookingId, newStatus });
  }
}
