export interface User {
  _id?: string;
  id?: string; // For compatibility
  firstName: string;
  lastName: string;
  middleName?: string; // made optional if not always required
  email: string;
  phoneNumber?: string;
  password?: string; // Optional for responses
  role?: 'owner' | 'renter' | 'admin';
  terms?: boolean; // Optional for responses
  country?: string;
  city?: string;
  address?: string;
  totalSpent?: number;
  notificationSettings?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterForm extends User {
  confirmPassword: string;
}

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}
