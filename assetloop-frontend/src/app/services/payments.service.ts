import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface CreateSessionResponse {
  id: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private apiUrl = 'http://localhost:5000/api/payments';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
  }

  createCheckoutSession(bookingId: string, opts?: { successUrl?: string; cancelUrl?: string; currency?: string }): Observable<CreateSessionResponse> {
    return this.http.post<CreateSessionResponse>(
      `${this.apiUrl}/create-checkout-session`,
      {
        bookingId,
        successUrl: opts?.successUrl,
        cancelUrl: opts?.cancelUrl,
        currency: opts?.currency,
      },
      { headers: this.getHeaders() }
    );
  }
}


