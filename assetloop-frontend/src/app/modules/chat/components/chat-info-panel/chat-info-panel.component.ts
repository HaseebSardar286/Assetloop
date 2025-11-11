import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AssetPreviewCardComponent } from '../asset-preview-card/asset-preview-card.component';
import { UserProfileCardComponent } from '../user-profile-card/user-profile-card.component';
import { ChatConversation } from '../../../../interfaces/chat';
import { ChatService } from '../../../../services/chat.service';
import { AuthService } from '../../../../services/auth.service';

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
export class ChatInfoPanelComponent implements OnInit, OnChanges {
  @Input() chatId!: string | null;
  @Input() userRole!: 'Renter' | 'Owner';
  selectedConversation: ChatConversation | null = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.chatId) {
      this.loadConversation();
    }
  }

  ngOnChanges(): void {
    if (this.chatId) {
      this.loadConversation();
    } else {
      this.selectedConversation = null;
    }
  }

  loadConversation(): void {
    if (!this.chatId) return;

    this.chatService.getConversations().subscribe({
      next: (response) => {
        this.selectedConversation = response.conversations.find(
          (c) => c._id === this.chatId
        ) || null;
      },
      error: (err) => {
        console.error('Failed to load conversation:', err);
        this.selectedConversation = null;
      }
    });
  }

  getAssetRoute(): string {
    if (!this.selectedConversation) return '#';
    const assetId = this.selectedConversation.asset._id;
    const currentPath = this.router.url;
    
    // Determine if we're in owner or renter route
    if (currentPath.startsWith('/owner/')) {
      // Owner can view asset details through their assets list
      return '/owner/assets';
    } else {
      // Renter can view asset details
      return `/renter/asset/${assetId}`;
    }
  }

  onViewListing(): void {
    const route = this.getAssetRoute();
    if (route !== '#') {
      this.router.navigate([route]);
    }
  }

  onBookNow(): void {
    if (!this.selectedConversation) return;
    const assetId = this.selectedConversation.asset._id;
    this.router.navigate(['/renter/asset', assetId]);
  }

  onReportUser(): void {
    // TODO: Implement report user functionality
    console.log('Report user functionality to be implemented');
    // Could navigate to a report page or open a modal
  }
}
