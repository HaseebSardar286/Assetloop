import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminMetrics } from '../interfaces/admin';
import { Booking } from '../interfaces/bookings';
import { Review } from '../interfaces/review';
import { User } from '../interfaces/user';
import { AssetResponse } from '../interfaces/asset';
import { Transaction } from '../interfaces/payments';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.apiBaseUrl}/admin`;

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

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getUserSummary(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${id}/summary`, {
      headers: this.getHeaders(),
    });
  }

  // Pending users
  getPendingUsers(): Observable<{ pendingUsers: User[]; total: number }> {
    return this.http.get<{ pendingUsers: User[]; total: number }>(
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

  getAllTransactions(params?: {
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<{
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<{
      transactions: Transaction[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`${this.apiUrl}/transactions`, {
      headers: this.getHeaders(),
      params: httpParams,
    });
  }

  updateTransactionStatus(id: string, status: string): Observable<{
    message: string;
    transaction: Transaction;
  }> {
    return this.http.put<{
      message: string;
      transaction: Transaction;
    }>(`${this.apiUrl}/transactions/${id}/status`, { status }, {
      headers: this.getHeaders(),
    });
  }
}
