import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../../interfaces/bookings';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-bubble.component.html',
  styleUrls: ['./message-bubble.component.css'],
})
export class MessageBubbleComponent {
  @Input() message!: Message;
  @Input() userRole!: 'Renter' | 'Owner';

  getStatusIcon(): string {
    switch (this.message.status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  }
}
