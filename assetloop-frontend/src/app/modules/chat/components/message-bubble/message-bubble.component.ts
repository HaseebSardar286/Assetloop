import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../../interfaces/chat';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-bubble.component.html',
  styleUrls: ['./message-bubble.component.css'],
})
export class MessageBubbleComponent {
  @Input() message!: ChatMessage;
  @Input() userRole!: string;

  constructor(private authService: AuthService) {}

  isOwnMessage(): boolean | null {
    const currentUser = this.authService.getCurrentUser();
    return currentUser && this.message.sender._id === currentUser._id;
  }

  getStatusIcon(): string {
    if (!this.isOwnMessage()) return '';
    
    if (this.message.isRead) {
      return '✓✓';
    } else {
      return '✓';
    }
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
  }
}
