import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';
import { OwnerService } from '../../../services/owner.service';
import { User } from '../../../interfaces/user';

@Component({
  selector: 'app-owner-profile',
  imports: [FormsModule, CommonModule, OwnerSideBarComponent, HeaderComponent],
  templateUrl: './owner-profile.component.html',
  styleUrl: './owner-profile.component.css',
})
export class OwnerProfileComponent {
  user: User = {
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'owner',
    terms: false,
    country: '',
    city: '',
    address: '',
  };

  settings: any = {
    emailEnabled: true,
    smsEnabled: false,
    inAppEnabled: true,
    pushEnabled: false,
    newBookings: true,
    bookingConfirmations: true,
    frequency: 'immediate',
    reminderThreshold: 1,
  };
  passwordData = {
    previousPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  error: string | null = null;

  accountStatus = {
    memberSince: 'January 2025',
    bookings: 2,
    reviews: 1,
  };

  constructor(private router: Router, private ownerService: OwnerService) {}
  ngOnInit(): void {
    this.getProfile();
    this.loadSettings();
  }

  getProfile() {
    this.ownerService.getProfile().subscribe({
      next: (data: User) => {
        this.user = data;
        console.log('Profile updated successfully', this.user);
      },
      error: (error: String) => {
        console.log('Error getting user profile data: ', error);
      },
    });
  }

  loadSettings(): void {
    this.ownerService.getNotificationSettings().subscribe({
      next: (data) => {
        this.settings = data;
        console.log('Notification settings:', data);
      },
      error: (err) => {
        console.error('Error loading settings:', err);
        alert(err.error?.message || 'Failed to load settings');
      },
    });
  }

  saveSettings(): void {
    this.ownerService.updateNotificationSettings(this.settings).subscribe({
      next: (data) => {
        this.settings = data;
        console.log('Settings saved:', data);
        alert('Settings updated successfully');
      },
      error: (err) => {
        console.error('Error saving settings:', err);
        alert(err.error?.message || 'Failed to save settings');
      },
    });
  }

  changePassword(): void {
    if (
      !this.passwordData.previousPassword ||
      !this.passwordData.newPassword ||
      !this.passwordData.confirmPassword
    ) {
      this.error = 'All password fields are required';
      return;
    }
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.error = 'New password and confirm password do not match';
      return;
    }
    this.ownerService.changePassword(this.passwordData).subscribe({
      next: () => {
        this.passwordData = {
          previousPassword: '',
          newPassword: '',
          confirmPassword: '',
        };
        this.error = null;
        alert('Password changed successfully');
      },
      error: (err) => {
        console.error('Error changing password:', err);
        this.error = err.error?.message || 'Failed to change password';
      },
    });
  }

  onSaveChanges() {
    console.log('Profile saved:', this.user);
    // Add your save logic here
  }

  onLogout() {
    this.router.navigate(['/auth/login']);
  }
}
