import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { LoginForm, RegisterForm, User } from '../interfaces/user';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`; // Backend URL
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Load user from token on service initialization
    this.loadUserFromToken();
  }

  register(data: RegisterForm): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  login(credentials: LoginForm): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = this.decodeToken(token);
    if (!decoded) return false;

    // Check if token is expired
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    return decoded?.role || null;
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token && this.isAuthenticated()) {
      const decoded = this.decodeToken(token);
      if (decoded) {
        this.currentUserSubject.next({
          _id: decoded.id,
          firstName: decoded.firstName || '',
          lastName: decoded.lastName || '',
          email: decoded.email || '',
          role: decoded.role,
          terms: false,
          verificationStatus: 'pending',
        });
      }
    }
  }

  decodeToken(token: string): any {
    try {
      if (!token) {
        return null;
      }
      // Split the token into its parts and decode the payload
      const payload = token.split('.')[1]; // Get the payload part
      if (!payload) {
        return null;
      }
      // Decode the base64 string and parse it as JSON
      const decodedPayload = atob(payload); // Decode base64
      return JSON.parse(decodedPayload); // Parse to object
    } catch (error) {
      console.error('Error decoding token:', error);
      return null; // Return null on error
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
  }

  // Method to make authenticated requests
  get(url: string): Observable<any> {
    return this.http.get(url, { headers: this.getHeaders() });
  }

  post(url: string, data: any): Observable<any> {
    return this.http.post(url, data, { headers: this.getHeaders() });
  }

  put(url: string, data: any): Observable<any> {
    return this.http.put(url, data, { headers: this.getHeaders() });
  }

  delete(url: string): Observable<any> {
    return this.http.delete(url, { headers: this.getHeaders() });
  }
}
