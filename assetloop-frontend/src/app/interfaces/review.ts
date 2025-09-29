import { Owner, Renter } from './rental';

export interface Review {
  _id: string;
  // Simplified - always expect populated objects from backend
  rental: {
    _id: string;
    name: string;
  };
  renter: Renter;
  owner?: Owner;
  rating: number; // 1-5
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}
