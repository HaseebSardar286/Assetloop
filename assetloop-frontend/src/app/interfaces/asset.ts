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
  images: string[]; // Changed from File[] to string[] for base64
  features: string[];
  amenities: string[];
}

export interface AssetResponse {
  _id: string;
  owner: string;
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
  images: string[]; // Paths stored in the database
  features: string[];
  amenities: string[];
  createdAt: string;
  updatedAt: string;
}
