import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AssetForm } from '../interfaces/asset';
import { AssetResponse } from '../interfaces/asset';
import { DashboardStats } from '../interfaces/ownerDashboard';
import { User } from '../interfaces/user';
import { Booking } from '../interfaces/bookings';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OwnerService {
  private apiUrl = `${environment.apiBaseUrl}/owner`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const items = { ...localStorage };
    console.log('localStorage contents:', items);
    const token = localStorage.getItem('authToken');
    console.log('Retrieved token with "authToken":', token);
    return new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
  }

  // createAsset(asset: AssetForm): Observable<AssetResponse> {
  //   console.log('Raw asset payload before send:', asset);
  //   return this.http.post<AssetResponse>(`${this.apiUrl}/create-asset`, asset, {
  //     headers: this.getHeaders(),
  //   });
  // }

  createAsset(formData: FormData): Observable<AssetResponse> {
    return this.http.post<AssetResponse>(
      `${this.apiUrl}/create-asset`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  getAssets(): Observable<AssetResponse[]> {
    return this.http.get<AssetResponse[]>(`${this.apiUrl}/assets`, {
      headers: this.getHeaders(),
    });
  }

  updateAsset(
    id: string,
    data: Partial<AssetForm> | FormData
  ): Observable<AssetResponse> {
    if (data instanceof FormData) {
      return this.http.put<AssetResponse>(`${this.apiUrl}/assets/${id}`, data, {
        headers: this.getHeaders(),
      });
    } else {
      return this.http.put<AssetResponse>(`${this.apiUrl}/assets/${id}/details`, data, {
        headers: this.getHeaders(),
      });
    }
  }

  deleteAsset(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/assets/${id}`,
      { headers: this.getHeaders() }
    );
  }

  getBookingDetails(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/bookings/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getBookings(): Observable<Booking[]> {

    return this.http.get<Booking[]>(`${this.apiUrl}/rental-requests`, {
      headers: this.getHeaders(),
    });
  }

  updateStatus(
    bookingId: string,
    newStatus: 'confirmed' | 'cancelled'
  ): Observable<Booking> {
    console.log('Updating status for booking:', bookingId, 'to', newStatus);
    return this.http.put<Booking>(
      `${this.apiUrl}/bookings/${bookingId}/status`,
      { status: newStatus },
      { headers: this.getHeaders() }
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, {
      headers: this.getHeaders(),
    });
  }

  updateProfile(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/update-profile`, user, {
      headers: this.getHeaders(),
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard-stats`, {
      headers: this.getHeaders(),
    });
  }

  getActiveBookings(): Observable<Booking[]> {
    return this.http
      .get<Booking[]>(`${this.apiUrl}/active-bookings`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((bookings) => console.log('Received active bookings:', bookings))
      );
  }

  getNotificationSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/notification-settings`, {
      headers: this.getHeaders(),
    });
  }

  updateNotificationSettings(settings: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/notification-settings`,
      settings,
      {
        headers: this.getHeaders(),
      }
    );
  }

  changePassword(data: {
    previousPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-password`, data, {
      headers: this.getHeaders(),
    });
  }

  getUsers(): Observable<{ users: User[]; totalUsers: number }> {
    return this.http.get<{ users: User[]; totalUsers: number }>(
      `${this.apiUrl}/users`,
      {
        headers: this.getHeaders(),
      }
    );
  }
}
