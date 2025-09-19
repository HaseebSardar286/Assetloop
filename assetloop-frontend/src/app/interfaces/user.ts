export interface NotificationSettings {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  inAppEnabled?: boolean;
  pushEnabled?: boolean;
  newBookings?: boolean;
  bookingConfirmations?: boolean;
  bookingCancellations?: boolean;
  activeReminders?: boolean;
  completedBookings?: boolean;
  pendingReviews?: boolean;
  assetStatusChanges?: boolean;
  paymentUpdates?: boolean;
  systemUpdates?: boolean;
  frequency?: 'immediate' | 'daily' | 'weekly';
  reminderThreshold?: number;
  email?: string;
  phoneNumber?: string;
}

export interface User {
  _id?: string; // Matches MongoDB's _id
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber?: string;
  password?: string; // Excluded in API responses
  role: 'owner' | 'renter' | 'admin'; // Made required to match backend
  terms?: boolean;
  country?: string;
  city?: string;
  address?: string;
  totalSpent?: number;
  notificationSettings?: NotificationSettings;
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
