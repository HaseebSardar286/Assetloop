export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  middleName?: string; // made optional if not always required
  email: string;
  phoneNumber?: string;
  password: string;
  role: 'owner' | 'renter' | 'admin';
  terms: boolean;
  country: string;
  city: string;
  address: string;
}

export interface RegisterForm extends User {
  confirmPassword: string;
}

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}
