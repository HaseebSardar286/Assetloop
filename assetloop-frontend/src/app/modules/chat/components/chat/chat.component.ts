import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  conversations: Chat[] = []; // Initialize empty array to match template reference

  onSelectChat(id: number) {
    this.selectedChatId = id;
  }

  onLogout() {
    // Handle logout
  }

  onNavigate(event: Event) {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      // Extract the path from the href attribute
      const path = target.getAttribute('href')!;
      // Navigate using the Router (implement navigation logic)
      console.log('Navigating to:', path);
      // Example: this.router.navigate([path]); // Uncomment and inject Router if needed
    }
  }
}
