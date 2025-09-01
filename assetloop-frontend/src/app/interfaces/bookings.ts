export interface Booking {
  id: number;
  name: string;
  address: string;
  dates: string;
  total: string;
  status: string;
  imageUrl?: string;
  category?: string;
  notes?: string;
}

export interface Message {
  id: number;
  sender: string; // e.g., "Renter" or "Owner"
  senderName: string; // e.g., "Ali" or "Haseeb"
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
}

export interface Chat {
  id: number;
  otherUser: {
    name: string;
    profilePic?: string;
    role: 'Renter' | 'Owner';
  };
  asset: Booking;
  lastMessage: Message;
  unreadCount: number;
}

export interface UserProfile {
  name: string;
  rating: number;
  isVerified: boolean;
}

export interface Bookings {
  upcoming: Booking[];
  past: Booking[];
  cancelled: Booking[];
}
