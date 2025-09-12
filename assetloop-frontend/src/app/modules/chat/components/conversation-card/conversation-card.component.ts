import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chat } from '../../../../interfaces/bookings';

@Component({
  selector: 'app-conversation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversation-card.component.html',
  styleUrls: ['./conversation-card.component.css'],
})
export class ConversationCardComponent {
  @Input() chat!: Chat;
  @Output() select = new EventEmitter<void>();
}
