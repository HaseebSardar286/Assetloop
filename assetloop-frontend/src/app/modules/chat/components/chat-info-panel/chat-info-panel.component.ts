import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AssetPreviewCardComponent } from '../asset-preview-card/asset-preview-card.component';
import { UserProfileCardComponent } from '../user-profile-card/user-profile-card.component';
import { Chat } from '../../../../interfaces/bookings';
@Component({
  selector: 'app-chat-info-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AssetPreviewCardComponent,
    UserProfileCardComponent,
  ],
  templateUrl: './chat-info-panel.component.html',
  styleUrls: ['./chat-info-panel.component.css'],
})
export class ChatInfoPanelComponent {
  @Input() chatId!: number | null;
  @Input() userRole!: 'Renter' | 'Owner';
  chats: Chat[] = [
    {
      id: 1,
      otherUser: { name: 'Ali', role: 'Owner' },
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
      otherUser: { name: 'Haseeb', role: 'Renter' },
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

  getSelectedChat(): Chat | undefined {
    return this.chatId
      ? this.chats.find((c) => c.id === this.chatId)
      : undefined;
  }
}
