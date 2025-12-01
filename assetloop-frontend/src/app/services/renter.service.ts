import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
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
  private favourites = new BehaviorSubject<Favourite[]>([]);
  private cart = new BehaviorSubject<CartItem[]>([]);

  constructor(private http: HttpClient) {}

  // Backend API Methods
  private getHeaders(): HttpHeaders {
    const items = { ...localStorage }; // Log all items for debugging
    console.log('localStorage contents:', items);
    const token = localStorage.getItem('authToken'); // Changed from 'token' to 'authToken'
    console.log('Retrieved token with "authToken":', token);
    return new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/auth/login`, {
      email,
      password,
    });
  }

  getProfile(): Observable<User> {
    console.log('Renter service get profile called!');
    return this.http.get<User>(`${this.apiUrl}/profile`, {
      headers: this.getHeaders(),
    });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-profile`, data, {
      headers: this.getHeaders(),
    });
  }

  getAllAssets(_p0: {}): Observable<{ assets: AssetResponse[] }> {
    return this.http.get<{ assets: AssetResponse[] }>(
      `${this.apiUrl}/allAssets`,
      {
        headers: this.getHeaders(),
      }
    );
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
    console.log('Notification settings renter:');
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
        total + (Number(item.pricePerNight) || 0) * item.quantity,
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
