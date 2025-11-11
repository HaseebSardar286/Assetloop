import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  faHeart,
  faShoppingCart,
  faShare,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AssetResponse } from '../../../interfaces/asset';
import { ChatService } from '../../../services/chat.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
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
  @Output() updateNotes = new EventEmitter<{ id: string; notes: string }>();

  faHeart = faHeart;
  faShoppingCart = faShoppingCart;
  faShare = faShare;
  faTrash = faTrash;

  constructor(
    private chatService: ChatService,
    private router: Router,
    private authService: AuthService
  ) {}

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

  onNotesChange(event: Event) {
    const notes = (event.target as HTMLInputElement).value;
    this.updateNotes.emit({ id: this.asset._id, notes });
  }

  startChatWithOwner(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Please login to start a chat');
      return;
    }

    const assetId = this.asset._id;
    const ownerId = (this.asset.owner as any)?._id;

    if (!assetId || !ownerId) {
      alert('Missing asset or owner information for chat');
      return;
    }

    this.chatService.getOrCreateConversation(String(assetId), String(ownerId)).subscribe({
      next: (response) => {
        this.router.navigate(['/renter/chat'], {
          queryParams: { conversationId: response.conversation._id },
        });
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to start chat');
      },
    });
  }
}
