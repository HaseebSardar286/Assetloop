import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversationCardComponent } from '../conversation-card/conversation-card.component';
import { ChatConversation } from '../../../../interfaces/chat';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ConversationCardComponent],
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.css'],
})
export class ConversationListComponent {
  @Output() selectChat = new EventEmitter<string>();
  searchQuery: string = '';
  @Input() conversations: ChatConversation[] = [];

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
