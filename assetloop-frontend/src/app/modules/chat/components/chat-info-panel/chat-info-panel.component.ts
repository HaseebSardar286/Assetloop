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
  chats: Chat[] = [];

  getSelectedChat(): Chat | undefined {
    return this.chatId
      ? this.chats.find((c) => c.id === this.chatId)
      : undefined;
  }
}
