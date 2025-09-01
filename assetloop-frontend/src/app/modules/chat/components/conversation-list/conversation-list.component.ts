import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversationCardComponent } from '../conversation-card/conversation-card.component';
import { Chat } from '../../../../interfaces/bookings';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ConversationCardComponent],
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.css'],
})
export class ConversationListComponent {
  @Output() selectChat = new EventEmitter<number>();
  searchQuery: string = '';
  conversations: Chat[] = [
    {
      id: 1,
      otherUser: {
        name: 'Ali',
        role: 'Owner',
        profilePic: '/images/profile.png',
      },
      asset: {
        id: 1,
        name: 'Honda Civic',
        address: 'Lahore',
        dates: '2025-09-01 to 2025-09-05',
        total: 'PKR 2,000/day',
        status: 'available',
      },
      lastMessage: {
        id: 1,
        sender: 'Owner',
        senderName: 'Ali',
        content: 'Available tomorrow?',
        timestamp: '2025-08-30 15:00',
        status: 'read',
      },
      unreadCount: 0,
    },
    {
      id: 2,
      otherUser: {
        name: 'Haseeb',
        role: 'Renter',
        profilePic: '/images/profile.png',
      },
      asset: {
        id: 2,
        name: '2-Bedroom Apartment',
        address: 'Karachi',
        dates: '2025-09-02 to 2025-09-06',
        total: 'PKR 5,000/day',
        status: 'available',
      },
      lastMessage: {
        id: 2,
        sender: 'Renter',
        senderName: 'Haseeb',
        content: 'Can I book for next week?',
        timestamp: '2025-08-30 14:30',
        status: 'read',
      },
      unreadCount: 1,
    },
  ];

  getFilteredConversations() {
    return this.conversations.filter(
      (c) =>
        c.otherUser.name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        c.asset.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}
