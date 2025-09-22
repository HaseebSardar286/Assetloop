import { Owner, Renter } from './rental';

export interface Booking {
  id: string;
  _id?: string; // For compatibility
  name: string;
  description?: string;
  price: number;
  owner: Owner;
  renter?: Renter;
  startDate: string | Date; // Backend sends string
  endDate: string | Date; // Backend sends string
  status:
    | 'pending'
    | 'confirmed'
    | 'active'
    | 'expiring soon'
    | 'overdue'
    | 'completed'
    | 'cancelled';
  totalPaid?: number;
  review?: { rating: number; comment?: string };
  address: string;
  imageUrl?: string;
  category?: string;
  notes?: string;
  createdAt?: string;
  requestDate?: string;
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
  current: Booking[];
  past: Booking[];
  cancelled: Booking[];
  pending: Booking[];
}
