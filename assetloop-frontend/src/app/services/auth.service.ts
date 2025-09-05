import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginForm, RegisterForm, User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth'; // Backend URL

  constructor(private http: HttpClient) {}

  register(data: RegisterForm): Observable<RegisterForm> {
    return this.http.post<RegisterForm>(`${this.apiUrl}/register`, data);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('authToken', response.token); // Ensure this matches
      })
    );
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
}
