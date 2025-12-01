import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RenterService } from '../../../services/renter.service';

@Component({
  selector: 'app-security-features',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security-features.component.html',
  styleUrls: ['./security-features.component.css'],
})
export class SecurityFeaturesComponent {
  loading = false;
  paymentNotifications = true;
  twoFactorAuth = false; // Placeholder as backend doesn't fully support 2FA toggle yet
  error: string | null = null;
  success: string | null = null;

  constructor(private renterService: RenterService) {
    this.loadSettings();
  }

  loadSettings() {
    this.loading = true;
    this.renterService.getNotificationSettings().subscribe({
      next: (settings) => {
        this.paymentNotifications = settings.paymentUpdates ?? true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load settings', err);
        this.loading = false;
      }
    });
  }

  updateSettings() {
    this.loading = true;
    this.error = null;
    this.success = null;

    // We only have API to update all notification settings, so we need to be careful
    // Ideally we should fetch all, update one, and save back.
    // For now, let's assume we just send what we have if the API supports partial updates
    // or we fetch-modify-save.
    // The RenterService.getNotificationSettings returns the whole object.

    this.renterService.getNotificationSettings().subscribe({
      next: (currentSettings) => {
        const newSettings = {
          ...currentSettings,
          paymentUpdates: this.paymentNotifications
        };

        this.renterService.updateNotificationSettings(newSettings).subscribe({
          next: () => {
            this.success = 'Security settings updated';
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to update settings';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to retrieve current settings';
        this.loading = false;
      }
    });
  }
}
