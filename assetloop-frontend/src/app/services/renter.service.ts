import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem, Favourite } from '../interfaces/rental';
import { Booking } from '../interfaces/bookings';
import { User } from '../interfaces/user';
import { RenterDashboardStats } from '../interfaces/ownerDashboard';
import { AssetResponse } from '../interfaces/asset';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RenterService {
  private apiUrl = `${environment.apiBaseUrl}/renter`;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  // Backend API Methods
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    // Check if running in browser to avoid SSR/Vercel errors
    if (isPlatformBrowser(this.platformId)) {
      // Check both 'authToken' and 'token' to ensure compatibility
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/auth/login`, {
      email,
      password,
    });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, {
      headers: this.getHeaders(),
    });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-profile`, data, {
      headers: this.getHeaders(),
    });
  }

  getAllAssets(category?: string): Observable<{ assets: AssetResponse[] }> {
    let url = `${this.apiUrl}/allAssets`;
    if (category && category !== 'All Categories') {
      url += `?category=${category}`;
    }
    return this.http.get<{ assets: AssetResponse[] }>(
      url,
      {
        headers: this.getHeaders(),
      }
    );
  }

  getAssetById(id: string): Observable<AssetResponse> {
    return this.http.get<AssetResponse>(`${this.apiUrl}/assets/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getDashboardStats(): Observable<RenterDashboardStats> {
    return this.http.get<RenterDashboardStats>(
      `${this.apiUrl}/dashboard-stats`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  getNotificationSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notification-settings`, {
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

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings`, {
      headers: this.getHeaders(),
    });
  }

  createBooking(bookingData: {
    assetId: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings`, bookingData, {
      headers: this.getHeaders(),
    });
  }

  cancelBooking(id: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/bookings/${id}/cancel`,
      {},
      { headers: this.getHeaders() }
    );
  }

  addReview(
    bookingId: string,
    rating: number,
    comment?: string
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/reviews`,
      { bookingId, rating, comment },
      { headers: this.getHeaders() }
    );
  }

  // Reviews read endpoints
  getAssetReviews(assetId: string): Observable<{
    reviews: Array<{
      rating: number;
      comment?: string;
      createdAt: string;
      reviewer: string;
    }>;
    averageRating?: number;
    totalReviews?: number;
  }> {
    return this.http.get<{
      reviews: Array<{
        rating: number;
        comment?: string;
        createdAt: string;
        reviewer: string;
      }>;
      averageRating?: number;
      totalReviews?: number;
    }>(`${this.apiUrl}/assets/${assetId}/reviews`, {
      headers: this.getHeaders(),
    });
  }

  getOwnerReviews(ownerId: string): Observable<{
    reviews: Array<{
      rating: number;
      comment?: string;
      createdAt: string;
      reviewer: string;
    }>;
  }> {
    return this.http.get<{
      reviews: Array<{
        rating: number;
        comment?: string;
        createdAt: string;
        reviewer: string;
      }>;
    }>(`${environment.apiBaseUrl}/owner/${ownerId}/reviews`, {
      headers: this.getHeaders(),
    });
  }

  // Favourites Management
  getFavourites(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/wishlist`, {
      headers: this.getHeaders(),
    });
  }

  addToFavourites(assetId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/wishlist`,
      { assetId },
      { headers: this.getHeaders() }
    );
  }

  removeFromFavourites(assetId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/wishlist/${assetId}`, {
      headers: this.getHeaders(),
    });
  }

  // Cart Management
  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}/cart`, {
      headers: this.getHeaders(),
    });
  }

  addToCart(item: Omit<CartItem, 'quantity'>) {
    return this.http.post(
      `${this.apiUrl}/cart`,
      { assetId: item.id, quantity: 1 },
      {
        headers: this.getHeaders(),
      }
    );
  }

  updateCartQuantity(id: string, quantity: number) {
    return this.http.put(
      `${this.apiUrl}/cart/${id}`,
      { quantity },
      {
        headers: this.getHeaders(),
      }
    );
  }

  removeFromCart(id: string) {
    return this.http.delete(`${this.apiUrl}/cart/${id}`, {
      headers: this.getHeaders(),
    });
  }

  clearCart() {
    return this.http.delete(`${this.apiUrl}/cart`, {
      headers: this.getHeaders(),
    });
  }

  // For DB-backed cart, compute on consumer side
  getCartTotalFrom(items: CartItem[]): number {
    return items.reduce(
      (total, item) =>
        total + (Number(item.pricePerDay) || 0) * item.quantity,
      0
    );
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
