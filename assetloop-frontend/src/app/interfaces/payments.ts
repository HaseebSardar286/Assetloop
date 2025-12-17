export interface Transaction {
  id: number | string;
  amount: number;
  status: 'successful' | 'pending' | 'failed' | 'completed' | 'cancelled';
  method?: 'card' | 'bank' | 'wallet';
  date?: string;
  createdAt?: string;
  type?: 'rent' | 'service fee' | 'refund' | 'deposit' | 'payment' | 'withdrawal' | 'payout';
  currency?: string;
  description?: string;
}

export interface PaymentMethod {
  id: number | string;
  type: 'card' | 'bank' | 'wallet';
  details: string;
  isDefault: boolean;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  name?: string;
}

export interface Invoice {
  id: number | string;
  bookingId: number | string;
  asset: string;
  dates: string;
  amounts: { rent: number; fees: number; insurance?: number; taxes?: number };
  status: 'paid' | 'pending' | 'failed';
}

export interface Refund {
  id: number | string;
  amount: number;
  status: 'in progress' | 'resolved' | 'rejected';
  timeline: string[];
}
