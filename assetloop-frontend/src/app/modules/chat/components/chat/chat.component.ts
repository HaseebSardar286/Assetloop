import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../components/header/header.component';
import { RenterSideBarComponent } from '../../../renter/renter-side-bar/renter-side-bar.component';
import { ConversationListComponent } from '../conversation-list/conversation-list.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { ChatInfoPanelComponent } from '../chat-info-panel/chat-info-panel.component';
import { ChatEmptyStateComponent } from '../chat-empty-state/chat-empty-state.component';
import { Chat } from '../../../../interfaces/bookings';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    RenterSideBarComponent,
    ConversationListComponent,
    ChatWindowComponent,
    ChatInfoPanelComponent,
    ChatEmptyStateComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  selectedChatId: number | null = null;
  userRole: 'Renter' | 'Owner' = 'Renter'; // Mock user role; replace with auth service
  conversations: Chat[] = [
    {
      id: 1,
      otherUser: {
        name: 'Ahmed Hassan',
        role: 'Owner',
        profilePic: '/images/profile.png',
      },
      asset: {
        id: 'mock-asset-1',
        _id: 'mock-asset-1',
        name: 'Toyota Corolla 2020',
        description: 'Well-maintained car with great mileage.',
        price: 55,
        owner: {
          firstName: 'Ahmed',
          middleName: '',
          lastName: 'Hassan',
          email: 'owner@example.com',
          contact: '',
        },
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'confirmed',
        address: 'Gulberg, Lahore',
        imageUrl: '/images/download.jpg',
        category: 'car',
      },
      lastMessage: {
        id: 101,
        sender: 'Owner',
        senderName: 'Ahmed Hassan',
        content: 'Pickup at 10 AM works for me.',
        timestamp: new Date().toISOString(),
        status: 'delivered',
      },
      unreadCount: 1,
    },
    {
      id: 2,
      otherUser: {
        name: 'Sara Ahmed',
        role: 'Owner',
        profilePic: '/images/profile.png',
      },
      asset: {
        id: 'mock-asset-2',
        _id: 'mock-asset-2',
        name: 'Apartment 2B - DHA',
        description: 'Cozy 1-bedroom apartment near park.',
        price: 80,
        owner: {
          firstName: 'Sara',
          middleName: '',
          lastName: 'Ahmed',
          email: 'owner2@example.com',
          contact: '',
        },
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        status: 'pending',
        address: 'DHA Phase 5, Karachi',
        imageUrl: '/images/download (1).jpg',
        category: 'apartment',
      },
      lastMessage: {
        id: 201,
        sender: 'Renter',
        senderName: 'You',
        content: 'Is early check-in possible?',
        timestamp: new Date().toISOString(),
        status: 'read',
      },
      unreadCount: 0,
    },
  ]; // Dummy conversations for UI testing

  constructor(private router: Router) {}

  onSelectChat(id: number) {
    this.selectedChatId = id;
  }

  onLogout() {
    this.router.navigate(['/auth/login']);
  }

  onNavigate(event: Event) {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      this.router.navigate([path]);
    }
  }
}
