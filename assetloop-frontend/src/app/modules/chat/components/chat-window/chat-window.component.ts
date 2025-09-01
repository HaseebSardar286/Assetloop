import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { Message } from '../../../../interfaces/bookings';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageBubbleComponent],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css'],
})
export class ChatWindowComponent {
  @Input() chatId!: number | null;
  @Input() userRole!: 'Renter' | 'Owner';
  newMessage: string = '';
  isTyping: boolean = false;
  messages: Message[] = [];

  ngOnChanges() {
    if (this.chatId) {
      this.messages = [
        {
          id: 1,
          sender: 'Owner',
          senderName: 'Ali',
          content: 'Hello, is this available?',
          timestamp: '2025-08-30 14:00',
          status: 'read',
        },
        {
          id: 2,
          sender: 'Renter',
          senderName: 'Haseeb',
          content: 'Yes, it is!',
          timestamp: '2025-08-30 14:05',
          status: 'read',
        },
      ];
    }
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      const message: Message = {
        id: Date.now(),
        sender: this.userRole,
        senderName: this.userRole === 'Renter' ? 'Haseeb' : 'Ali',
        content: this.newMessage,
        timestamp: new Date().toLocaleString('en-US', {
          timeZone: 'Asia/Karachi',
        }),
        status: 'sent',
      };
      this.messages.push(message);
      this.newMessage = '';
      this.isTyping = false;
    }
  }
}
