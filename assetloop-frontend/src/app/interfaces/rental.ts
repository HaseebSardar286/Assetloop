export interface Owner {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  contact?: string;
}

export interface Renter {
  _id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  contact?: string;
}

export interface Favourite {
  id: string;
  name: string;
  address: string;
  pricePerDay?: string;
  description?: string;
  amenities?: string[];
  imageUrl?: string;
}

export interface CartItem {
  id: string;
  name: string;
  address: string;
  pricePerDay: string;
  description: string;
  amenities: string[];
  imageUrl?: string;
  quantity: number;
}
