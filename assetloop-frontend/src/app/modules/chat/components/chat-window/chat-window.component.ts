import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { ChatMessage } from '../../../../interfaces/chat';
import { ChatService } from '../../../../services/chat.service';
import { AuthService } from '../../../../services/auth.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageBubbleComponent],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css'],
})
export class ChatWindowComponent implements OnInit, OnDestroy, OnChanges {
  @Input() chatId!: string | null;
  @Input() userRole!: string;
  newMessage: string = '';
  isTyping: boolean = false;
  messages: ChatMessage[] = [];
  loading = false;
  error: string | null = null;
  private refreshSubscription?: Subscription;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Load messages if chatId is already set (e.g., from query params)
    if (this.chatId) {
      this.loadMessages();
      // Refresh messages every 10 seconds
      this.refreshSubscription = interval(10000).subscribe(() => {
        this.loadMessages();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  ngOnChanges(): void {
    if (this.chatId) {
      this.messages = []; // Clear messages when switching conversations
      this.loadMessages();
      // Restart refresh subscription
      if (this.refreshSubscription) {
        this.refreshSubscription.unsubscribe();
      }
      this.refreshSubscription = interval(10000).subscribe(() => {
        this.loadMessages();
      });
    } else {
      this.messages = [];
      if (this.refreshSubscription) {
        this.refreshSubscription.unsubscribe();
        this.refreshSubscription = undefined;
      }
    }
  }

  loadMessages(): void {
    if (!this.chatId) return;

    this.loading = true;
    this.error = null;

    this.chatService.getMessages(this.chatId).subscribe({
      next: (response) => {
        this.messages = response.messages;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load messages';
        this.loading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.chatId) return;

    const content = this.newMessage.trim();
    this.newMessage = '';
    this.isTyping = false;

    this.chatService.sendMessage(this.chatId, content).subscribe({
      next: (response) => {
        // Reload messages to get the latest state
        this.loadMessages();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to send message';
        // Restore the message if sending failed
        this.newMessage = content;
      }
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
