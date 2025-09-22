export interface notificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  newBookings: boolean;
  bookingConfirmations: boolean;
  bookingCancellations: boolean;
  activeReminders: boolean;
  completedBookings: boolean;
  pendingReviews: boolean;
  assetStatusChanges: boolean;
  paymentUpdates: boolean;
  systemUpdates: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  reminderThreshold: number;
  email?: string;
  phoneNumber?: string;
}
export interface User {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: 'admin' | 'owner' | 'renter';
  phoneNumber?: string;
  country?: string;
  password?: string;
  terms: boolean;
  city?: string;
  address?: string;
  totalSpent?: number;
  createdAt?: string;

  verification?: {
    fullName: string;
    dateOfBirth: string;
    issueDate: string;
    expiryDate: string;
    cnicNumber: string;
    address: string;
    idFront: string;
    idBack: string;
    selfie: string;
  };
  verificationStatus: 'pending' | 'approved' | 'rejected';
}
export interface RegisterForm extends User {
  confirmPassword: string;
}

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}
