import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  faHeart,
  faShoppingCart,
  faShare,
  faTrash,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AssetResponse } from '../../../interfaces/asset';
import { ChatService } from '../../../services/chat.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SystemCurrencyPipe } from '../../../pipes/currency.pipe';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, SystemCurrencyPipe],
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.css'],
})
export class ProductItemComponent {
  @Input() asset!: AssetResponse;
  @Input() isFavourite: boolean = false;
  @Input() likedCount?: number;
  @Output() viewListing = new EventEmitter<string>();
  @Output() removeFavourite = new EventEmitter<string>();
  @Output() addToCart = new EventEmitter<string>();
  @Output() share = new EventEmitter<string>();

  faHeart = faHeart;
  faShoppingCart = faShoppingCart;
  faShare = faShare;
  faTrash = faTrash;
  faArrowRight = faArrowRight;
  isRenter: boolean = false;

  constructor(
    private chatService: ChatService,
    private router: Router,
    private authService: AuthService
  ) {
    this.isRenter = this.authService.getUserRole() === 'renter';
  }

  onViewListing() {
    this.viewListing.emit(this.asset._id);
  }

  onRemoveFavourite() {
    this.removeFavourite.emit(this.asset._id);
  }

  onAddToCart() {
    this.addToCart.emit(this.asset._id);
  }

  onShare() {
    this.share.emit(this.asset._id);
  }

  startChatWithOwner(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Please login to start a chat');
      return;
    }

    const userRole = this.authService.getUserRole();
    const assetId = this.asset._id;
    const ownerId = (this.asset.owner as any)?._id;

    if (!assetId || !ownerId) {
      alert('Missing asset or owner information for chat');
      return;
    }

    this.chatService.getOrCreateConversation(String(assetId), String(ownerId)).subscribe({
      next: (response) => {
        // Navigate to appropriate chat route based on user role
        const chatRoute = userRole === 'owner' ? '/owner/chat' : '/renter/chat';
        this.router.navigate([chatRoute], {
          queryParams: { conversationId: response.conversation._id },
        });
      },
      error: (err) => {
        console.error('Chat error:', err);
        alert(err?.error?.message || 'Failed to start chat');
      },
    });
  }
}
