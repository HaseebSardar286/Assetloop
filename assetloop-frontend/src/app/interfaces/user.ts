export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  middleName?: string; // made optional if not always required
  email: string;
  phoneNumber?: string;
  password: string;
  role?: string | 'owner' | 'renter';
  terms: boolean;
  country: string;
  city: string;
  address: string;
}

export interface RegisterForm extends User {
  confirmPassword: string;
}
