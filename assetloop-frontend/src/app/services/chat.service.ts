import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    role: string;
  };
  messageType: 'text' | 'image' | 'file' | 'system';
  mediaUrl?: string;
  isRead: boolean;
  readAt?: string;
  isEdited: boolean;
  editedAt?: string;
  replyTo?: any;
  timestamp: string;
  createdAt: string;
}

export interface ChatConversation {
  _id: string;
  otherUser: {
    _id: string;
    name: string;
    role: string;
    email: string;
  };
  asset: {
    _id: string;
    name: string;
    address: string;
    price: number;
    images: string[];
    category: string;
  };
  lastMessage?: {
    _id: string;
    content: string;
    sender: string;
    timestamp: string;
    messageType: string;
  };
  unreadCount: number;
  lastMessageAt: string;
  createdAt: string;
}

export interface ConversationResponse {
  conversation: {
    _id: string;
    participants: any[];
    asset: any;
    lastMessage?: any;
    lastMessageAt: string;
    isActive: boolean;
    createdAt: string;
  };
}

export interface MessagesResponse {
  messages: ChatMessage[];
  total: number;
  page: number;
  pages: number;
}

export interface ConversationsResponse {
  conversations: ChatConversation[];
  total: number;
  page: number;
  pages: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = `${environment.apiBaseUrl}/chat`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
  }

  // Get or create conversation between users for a specific asset
  getOrCreateConversation(assetId: string, otherUserId: string): Observable<ConversationResponse> {
    return this.http.get<ConversationResponse>(
      `${this.apiUrl}/conversation/${assetId}/${otherUserId}`,
      { headers: this.getHeaders() }
    );
  }

  // Get all conversations for current user
  getConversations(page: number = 1, limit: number = 20): Observable<ConversationsResponse> {
    return this.http.get<ConversationsResponse>(
      `${this.apiUrl}/conversations?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  // Get messages for a specific conversation
  getMessages(conversationId: string, page: number = 1, limit: number = 50): Observable<MessagesResponse> {
    return this.http.get<MessagesResponse>(
      `${this.apiUrl}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  // Send a new message
  sendMessage(conversationId: string, content: string, messageType: string = 'text', mediaUrl?: string, replyTo?: string): Observable<any> {
    const body = {
      content,
      messageType,
      mediaUrl,
      replyTo
    };

    return this.http.post(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      body,
      { headers: this.getHeaders() }
    );
  }

  // Mark messages as read
  markAsRead(conversationId: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/conversations/${conversationId}/read`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Get unread message count
  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(
      `${this.apiUrl}/unread-count`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => this.unreadCountSubject.next(response.unreadCount))
    );
  }

  // Delete a message
  deleteMessage(messageId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/messages/${messageId}`,
      { headers: this.getHeaders() }
    );
  }

  // Update unread count (for real-time updates)
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
}
