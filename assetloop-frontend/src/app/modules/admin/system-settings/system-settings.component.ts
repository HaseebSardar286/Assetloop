import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

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
export class SystemSettingsComponent {
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

  onLogout() {
    // Handle logout
  }

  onNavigate(event: Event) {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      console.log('Navigating to:', path);
    }
  }

  saveSettings() {
    console.log('Settings saved:', this.settings);
  }
}
