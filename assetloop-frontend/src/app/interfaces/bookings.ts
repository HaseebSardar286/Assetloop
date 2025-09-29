import { AssetResponse } from './asset';
import { Owner, Renter } from './rental';

export interface Booking {
  _id: string;
  id: string; // For compatibility
  name: string;
  description?: string;
  price: number;
  // Backend sends owner as populated object or ObjectId
  owner: Owner;
  // Backend sends renter as populated object or ObjectId
  renter?: Renter;
  // Backend sends asset as populated object or ObjectId
  asset?: AssetResponse;
  startDate: string | Date; // Backend sends Date but frontend may receive string
  endDate: string | Date; // Backend sends Date but frontend may receive string
  status:
    | 'pending'
    | 'confirmed'
    | 'active'
    | 'expiring soon'
    | 'overdue'
    | 'completed'
    | 'cancelled';
  totalPaid?: number;
  review?: string; // ObjectId reference to Review
  address?: string;
  imageUrl?: string;
  category?: string;
  notes?: string;
  requestDate?: string | Date;
  createdAt?: string;
  updatedAt?: string;
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
