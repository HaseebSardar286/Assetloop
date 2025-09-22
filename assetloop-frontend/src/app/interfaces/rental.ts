export interface Owner {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contact: string;
}

export interface Renter {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contact: string;
}

export interface Favourite {
  id: string;
  name: string;
  address: string;
  pricePerNight: string;
  description: string;
  amenities: string[];
  imageUrl: string;
}

export interface CartItem {
  id: string;
  name: string;
  address: string;
  pricePerNight: string;
  description: string;
  amenities: string[];
  imageUrl: string;
  quantity: number;
}
