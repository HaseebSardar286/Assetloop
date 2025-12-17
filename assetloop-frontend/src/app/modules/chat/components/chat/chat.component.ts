import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HeaderComponent } from '../../../../components/header/header.component';
import { RenterSideBarComponent } from '../../../renter/renter-side-bar/renter-side-bar.component';
import { OwnerSideBarComponent } from '../../../owner/owner-side-bar/owner-side-bar.component';
import { ConversationListComponent } from '../conversation-list/conversation-list.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { ChatInfoPanelComponent } from '../chat-info-panel/chat-info-panel.component';
import { ChatEmptyStateComponent } from '../chat-empty-state/chat-empty-state.component';
import { ChatService, ChatConversation } from '../../../../services/chat.service';
import { AuthService } from '../../../../services/auth.service';
import { interval, Subscription, filter } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMessage, faArrowRotateRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    RenterSideBarComponent,
    OwnerSideBarComponent,
    ConversationListComponent,
    ChatWindowComponent,
    ChatInfoPanelComponent,
    ChatEmptyStateComponent,
    FontAwesomeModule,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  faMessage = faMessage;
  faArrowRotateRight = faArrowRotateRight;
  selectedChatId: string | null = null;
  userRole: string = '';
  conversations: ChatConversation[] = [];
  loading = false;
  error: string | null = null;
  private refreshSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Determine user role from route path or auth service
    this.determineUserRole();
    
    // Listen to route changes to update role if needed
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.determineUserRole();
      });
    
    this.loadConversations();
    this.loadUnreadCount();
    
    // Check for conversation ID in query params
    this.route.queryParams.subscribe(params => {
      if (params['conversationId']) {
        this.selectedChatId = params['conversationId'];
      }
    });
    
    // Refresh conversations every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadConversations();
      this.loadUnreadCount();
    });
  }

  private determineUserRole(): void {
    // Route path is more reliable since routes are clearly separated
    const currentPath = this.router.url;
    if (currentPath.startsWith('/owner/')) {
      this.userRole = 'owner';
    } else if (currentPath.startsWith('/renter/')) {
      this.userRole = 'renter';
    } else {
      // Fallback to auth service if route doesn't indicate role
      this.userRole = this.authService.getUserRole() || 'renter';
    }
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadConversations(): void {
    this.loading = true;
    this.error = null;
    
    this.chatService.getConversations().subscribe({
      next: (response) => {
        this.conversations = response.conversations;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load conversations';
        this.loading = false;
      }
    });
  }

  loadUnreadCount(): void {
    this.chatService.getUnreadCount().subscribe({
      next: (response) => {
        // Unread count is handled by the service's BehaviorSubject
      },
      error: (err) => {
        console.error('Failed to load unread count:', err);
      }
    });
  }

  onSelectChat(conversationId: string): void {
    this.selectedChatId = conversationId;
    // Mark messages as read when selecting a conversation
    this.chatService.markAsRead(conversationId).subscribe({
      next: () => {
        // Update local unread count
        const conversation = this.conversations.find(c => c._id === conversationId);
        if (conversation) {
          conversation.unreadCount = 0;
        }
        this.loadUnreadCount();
      },
      error: (err) => {
        console.error('Failed to mark messages as read:', err);
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
  }

  isOwner(): boolean {
    return this.userRole === 'owner';
  }

  isRenter(): boolean {
    return this.userRole === 'renter';
  }
}
