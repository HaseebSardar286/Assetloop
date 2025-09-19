import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderComponent,
    AdminSidebarComponent,
  ],
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.css'],
})
export class SystemSettingsComponent implements OnInit {
  settings = {
    platformName: 'Rental Platform',
    emailNotifications: true,
    notificationFrequency: 'daily',
    currency: 'PKR',
    timezone: 'Asia/Karachi',
    maintenanceMode: false,
    maxListingsPerUser: 10,
    maxRequestsPerUser: 5,
    sessionTimeout: 30,
    twoFactorAuth: true,
    allowedFileTypes: 'jpg,png,pdf',
    defaultLanguage: 'en',
    theme: 'light',
  };
  error: string | null = null;
  success: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.adminService.getSystemSettings().subscribe({
      next: (data) => {
        this.settings = { ...this.settings, ...data };
        this.success = null;
        this.error = null;
      },
      error: (err) => {
        console.error('Error fetching settings:', err);
        this.error =
          err.status === 500
            ? `Server error: ${err.error?.message || 'Internal Server Error'}`
            : err.error?.message || 'Failed to load settings';
      },
    });
  }

  saveSettings(form?: NgForm): void {
    if (form && !form.valid) {
      this.error = 'Please fill out all required fields correctly';
      return;
    }
    this.adminService.updateSystemSettings(this.settings).subscribe({
      next: (data) => {
        this.settings = data;
        this.success = 'Settings saved successfully';
        this.error = null;
        setTimeout(() => (this.success = null), 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to save settings';
        this.success = null;
      },
    });
  }

  resetToDefault(): void {
    this.settings = {
      platformName: 'Rental Platform',
      emailNotifications: true,
      notificationFrequency: 'daily',
      currency: 'PKR',
      timezone: 'Asia/Karachi',
      maintenanceMode: false,
      maxListingsPerUser: 10,
      maxRequestsPerUser: 5,
      sessionTimeout: 30,
      twoFactorAuth: true,
      allowedFileTypes: 'jpg,png,pdf',
      defaultLanguage: 'en',
      theme: 'light',
    };
    this.saveSettings();
  }

  onLogout(): void {
    localStorage.removeItem('authToken');
    window.location.href = '/auth/login';
  }

  onNavigate(event: Event): void {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      console.log('Navigating to:', path);
    }
  }
}
