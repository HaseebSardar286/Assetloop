export interface Transaction {
  id: number;
  amount: number;
  status: 'successful' | 'pending' | 'failed';
  method: 'card' | 'bank' | 'wallet';
  date: string;
  type?: 'rent' | 'service fee' | 'refund' | 'deposit';
}

export interface PaymentMethod {
  id: number;
  type: 'card' | 'bank' | 'wallet';
  details: string;
  isDefault: boolean;
}

export interface Invoice {
  id: number;
  bookingId: number;
  asset: string;
  dates: string;
  amounts: { rent: number; fees: number; insurance?: number; taxes?: number };
  status: 'paid' | 'pending' | 'failed';
}

export interface Refund {
  id: number;
  amount: number;
  status: 'in progress' | 'resolved' | 'rejected';
  timeline: string[];
}
