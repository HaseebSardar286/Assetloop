import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminMetrics } from '../interfaces/admin';

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
    return this.http.get<AdminMetrics>(`${this.apiUrl}/metrics`, {
      headers: this.getHeaders(),
    });
  }

  refreshMetrics(): void {
    // Trigger a refresh - can be used with a service event or RxJS Subject
    // Implementation depends on how you want to notify components
  }
}
