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
