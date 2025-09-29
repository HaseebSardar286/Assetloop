// export interface notificationSettings {
//   emailEnabled: boolean;
//   smsEnabled: boolean;
//   inAppEnabled: boolean;
//   pushEnabled: boolean;
//   newBookings: boolean;
//   bookingConfirmations: boolean;
//   bookingCancellations: boolean;
//   activeReminders: boolean;
//   completedBookings: boolean;
//   pendingReviews: boolean;
//   assetStatusChanges: boolean;
//   paymentUpdates: boolean;
//   systemUpdates: boolean;
//   frequency: 'immediate' | 'daily' | 'weekly';
//   reminderThreshold: number;
//   email?: string;
//   phoneNumber?: string;
// }
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
  city?: string;
  address?: string;
  totalSpent?: number;
  createdAt?: string;
  updatedAt?: string;
  terms?: boolean; // For registration form compatibility

  notificationSettings?: {
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
  };

  verification?: {
    fullName: string;
    dateOfBirth: string | Date;
    issueDate: string | Date;
    expiryDate: string | Date;
    cnicNumber: string;
    address: string;
    idFront: string;
    idBack: string;
    selfie: string;
  };
  verificationStatus?: 'pending' | 'approved' | 'rejected';
}
export interface RegisterForm extends User {
  confirmPassword: string;
  terms: boolean;
}

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}
