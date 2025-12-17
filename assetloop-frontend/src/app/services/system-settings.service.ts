import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SystemSettings {
  _id?: string;
  platformName: string;
  emailNotifications: boolean;
  notificationFrequency: 'daily' | 'weekly' | 'instant';
  currency: 'PKR' | 'USD' | 'EUR';
  timezone: string;
  maintenanceMode: boolean;
  maxListingsPerUser: number;
  maxRequestsPerUser: number;
  sessionTimeout: number;
  twoFactorAuth: boolean;
  allowedFileTypes: string;
  defaultLanguage: 'en' | 'ur';
  theme: 'light' | 'dark';
}

@Injectable({
  providedIn: 'root',
})
export class SystemSettingsService {
  private apiUrl = `${environment.apiBaseUrl}/settings`;
  private settingsSubject = new BehaviorSubject<SystemSettings | null>(null);
  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSettings();
  }

  loadSettings(): void {
    this.http.get<SystemSettings>(this.apiUrl).subscribe({
      next: (settings) => {
        this.settingsSubject.next(settings);
        this.applySettings(settings);
      },
      error: (err) => {
        console.error('Failed to load system settings:', err);
        // Use default settings if API fails
        const defaultSettings: SystemSettings = {
          platformName: 'AssetLoop',
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
        this.settingsSubject.next(defaultSettings);
        this.applySettings(defaultSettings);
      },
    });
  }

  getSettings(): Observable<SystemSettings> {
    return this.http.get<SystemSettings>(this.apiUrl).pipe(
      tap((settings) => {
        this.settingsSubject.next(settings);
        this.applySettings(settings);
      })
    );
  }

  getCurrentSettings(): SystemSettings | null {
    return this.settingsSubject.value;
  }

  formatCurrency(amount: number): string {
    const settings = this.settingsSubject.value;
    const currency = settings?.currency || 'PKR';
    const symbol = currency === 'PKR' ? 'PKR' : currency === 'USD' ? '$' : '€';
    return `${symbol} ${amount.toLocaleString()}`;
  }

  isMaintenanceMode(): boolean {
    return this.settingsSubject.value?.maintenanceMode || false;
  }

  getMaxListingsPerUser(): number {
    return this.settingsSubject.value?.maxListingsPerUser || 10;
  }

  getMaxRequestsPerUser(): number {
    return this.settingsSubject.value?.maxRequestsPerUser || 5;
  }

  getAllowedFileTypes(): string[] {
    const settings = this.settingsSubject.value;
    const types = settings?.allowedFileTypes || 'jpg,png,pdf';
    return types.split(',').map((t) => t.trim().toLowerCase());
  }

  private applySettings(settings: SystemSettings): void {
    // Apply theme
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', settings.theme);
      if (settings.theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }

    // Store currency in localStorage for quick access
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('systemCurrency', settings.currency);
    }
  }

  refreshSettings(): void {
    this.loadSettings();
  }
}

