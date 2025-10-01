import { Owner } from './rental';

export interface AssetForm {
  name: string;
  address: string;
  description: string;
  price: string | number;
  startDate?: string;
  endDate?: string;
  availability: 'available' | 'unavailable';
  status: 'Active' | 'Inactive';
  category: 'car' | 'apartment' | 'house' | 'tool';
  capacity: string | number;
  images: File[]; // Files for form upload
  features: string[];
  amenities: string[];
}

export interface AssetResponse {
  _id: string;
  id?: string; // For compatibility
  owner: Owner;
  name: string;
  address: string;
  description: string;
  price: number;
  startDate?: string;
  endDate?: string;
  availability: 'available' | 'unavailable';
  status: 'Active' | 'Inactive';
  category: 'car' | 'apartment' | 'house' | 'tool';
  capacity: number;
  images: string[]; // Supabase URLs
  features: string[];
  amenities: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
