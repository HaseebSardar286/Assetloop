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
  images: string[]; // For form upload
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
  images: string[]; // Base64 strings or URLs
  features: string[];
  amenities: string[];
  notes?: string; // For user notes
  createdAt: string;
  updatedAt: string;
}
