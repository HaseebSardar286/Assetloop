import { AssetResponse } from './asset';

// interfaces/owner.ts
export interface BookingResponse {
  _id: string;
  renter: string;
  owner: string;
  asset: AssetResponse;
  startDate: string;
  endDate: string;
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdate {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phoneNumber?: string;
  country?: string;
  address?: string;
  city?: string;
}
