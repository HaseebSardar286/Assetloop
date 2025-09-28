import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminMetrics } from '../interfaces/admin';
import { Booking } from '../interfaces/bookings';
import { Review } from '../interfaces/review';
import { User } from '../interfaces/user';
import { AssetResponse } from '../interfaces/asset';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:5000/api/admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
  }

  getAdminMetrics(): Observable<AdminMetrics> {
    return this.http.get<AdminMetrics>(`${this.apiUrl}/dashboard-stats`, {
      headers: this.getHeaders(),
    });
  }

  getAllBookings(): Observable<{ bookings: Booking[]; totalBookings: number }> {
    return this.http.get<{ bookings: Booking[]; totalBookings: number }>(
      `${this.apiUrl}/bookings`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  // getAllReviews(): Observable<{ reviews: Review[]; totalReviews: number }> {
  //   return this.http.get<{ reviews: Review[]; totalReviews: number }>(
  //     `${this.apiUrl}/reviews`,
  //     {
  //       headers: this.getHeaders(),
  //     }
  //   );
  // }

  getUsers(): Observable<{ users: User[]; totalUsers: number }> {
    return this.http.get<{ users: User[]; totalUsers: number }>(
      `${this.apiUrl}/users`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  // Pending users
  getPendingUsers(): Observable<{ pendingUsers: any[]; total: number }> {
    return this.http.get<{ pendingUsers: any[]; total: number }>(
      `${this.apiUrl}/pending-users`,
      { headers: this.getHeaders() }
    );
  }

  getPendingUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pending-users/${id}`, {
      headers: this.getHeaders(),
    });
  }

  approvePendingUser(id: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/pending-users/${id}/approve`,
      {},
      { headers: this.getHeaders() }
    );
  }

  rejectPendingUser(id: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/pending-users/${id}/reject`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getAssets(): Observable<{ assets: AssetResponse[]; totalAssets: number }> {
    return this.http.get<{ assets: AssetResponse[]; totalAssets: number }>(
      `${this.apiUrl}/assets`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, {
      headers: this.getHeaders(),
    });
  }

  deleteAsset(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/assets/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getSystemSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/settings`, {
      headers: this.getHeaders(),
    });
  }

  updateSystemSettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings`, settings, {
      headers: this.getHeaders(),
    });
  }

  getAllReviews(
    search: string = ''
  ): Observable<{ reviews: Review[]; totalReviews: number }> {
    const params = { search };
    return this.http.get<{ reviews: Review[]; totalReviews: number }>(
      `${this.apiUrl}/reviews`,
      { headers: this.getHeaders(), params }
    );
  }

  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
