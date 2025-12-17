import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { SystemSettingsService } from './services/system-settings.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'assetloop-frontend';

  constructor(
    private systemSettingsService: SystemSettingsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load system settings on app initialization
    this.systemSettingsService.getSettings().subscribe({
      next: (settings) => {
        // Check maintenance mode
        if (settings.maintenanceMode) {
          // Redirect to maintenance page or show message
          const currentPath = this.router.url;
          if (!currentPath.includes('/maintenance')) {
            // You can create a maintenance component or just show an alert
            alert('System is under maintenance. Please try again later.');
          }
        }
      },
      error: (err) => {
        console.error('Failed to load system settings:', err);
      },
    });
  }
}
