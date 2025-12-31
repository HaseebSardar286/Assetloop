import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, PaymentMethod, Invoice, Refund } from '../interfaces/payments';
import { environment } from '../../environments/environment';

interface CreateSessionResponse {
  id: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private apiUrl = `${environment.apiBaseUrl}/payments`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const headers = new HttpHeaders();
    return token ? headers.set('Authorization', `Bearer ${token}`) : headers;
  }
  private cacheBust(): string {
    return Date.now().toString();
  }

  createCheckoutSession(
    bookingId: string,
    opts?: { successUrl?: string; cancelUrl?: string; currency?: string }
  ): Observable<CreateSessionResponse> {
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

  // Wallet
  getWallet(): Observable<{
    balance: number;
    transactions: Transaction[];
  }> {
    return this.http.get<{
      balance: number;
      transactions: Transaction[];
    }>(`${this.apiUrl}/wallet?ts=${this.cacheBust()}`, { headers: this.getHeaders() });
  }

  addMoney(amount: number, successUrl?: string, cancelUrl?: string): Observable<{ id: string; url: string }> {
    return this.http.post<{ id: string; url: string }>(
      `${this.apiUrl}/wallet/add`,
      { 
        amount,
        successUrl: successUrl || `${window.location.origin}/payments?status=success&source=wallet_topup`,
        cancelUrl: cancelUrl || `${window.location.origin}/payments?status=cancelled&source=wallet_topup`
      },
      { headers: this.getHeaders() }
    );
  }

  withdraw(
    amount: number,
    payoutMethodId?: number | string
  ): Observable<{ success: boolean; balance: number }> {
    return this.http.post<{ success: boolean; balance: number }>(
      `${this.apiUrl}/wallet/withdraw`,
      { amount, payoutMethodId },
      { headers: this.getHeaders() }
    );
  }

  // Payment methods
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/methods`, {
      headers: this.getHeaders(),
    });
  }

  addPaymentMethod(
    method: Omit<PaymentMethod, 'id' | 'isDefault'> & { isDefault?: boolean }
  ): Observable<PaymentMethod[]> {
    return this.http.post<PaymentMethod[]>(`${this.apiUrl}/methods`, method, {
      headers: this.getHeaders(),
    });
  }

  removePaymentMethod(id: number | string): Observable<{ success: boolean; methods?: PaymentMethod[] }> {
    return this.http.delete<{ success: boolean; methods?: PaymentMethod[] }>(
      `${this.apiUrl}/methods/${id}`,
      { headers: this.getHeaders() }
    );
  }

  setDefaultPaymentMethod(id: number | string): Observable<{ success: boolean; methods?: PaymentMethod[] }> {
    return this.http.post<{ success: boolean; methods?: PaymentMethod[] }>(
      `${this.apiUrl}/methods/${id}/default`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Transactions
  getTransactions(params?: {
    date?: string;
    type?: string;
    bookingId?: string;
  }): Observable<Transaction[]> {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.type) query.set('type', params.type);
    if (params?.bookingId) query.set('bookingId', params.bookingId);
    query.set('ts', this.cacheBust());
    const qs = query.toString();
    return this.http.get<Transaction[]>(
      `${this.apiUrl}/transactions${qs ? `?${qs}` : ''}`,
      { headers: this.getHeaders() }
    );
  }

  // Invoices and refunds (for completeness)
  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/invoices`, {
      headers: this.getHeaders(),
    });
  }

  getRefunds(): Observable<Refund[]> {
    return this.http.get<Refund[]>(`${this.apiUrl}/refunds`, {
      headers: this.getHeaders(),
    });
  }

  // Test payment methods (for development/testing without Stripe)
  testBookingPayment(bookingId: string): Observable<{ success: boolean; message: string; amount: number; bookingId: string }> {
    return this.http.post<{ success: boolean; message: string; amount: number; bookingId: string }>(
      `${this.apiUrl}/test/booking-payment`,
      { bookingId },
      { headers: this.getHeaders() }
    );
  }

  testWalletTopup(amount: number): Observable<{ success: boolean; message: string; amount: number; balance: number }> {
    return this.http.post<{ success: boolean; message: string; amount: number; balance: number }>(
      `${this.apiUrl}/test/wallet-topup`,
      { amount },
      { headers: this.getHeaders() }
    );
  }

  verifyPayment(sessionId: string): Observable<{
    success: boolean;
    message: string;
    balance?: number;
    amount?: number;
    alreadyProcessed?: boolean;
    paymentStatus?: string;
  }> {
    return this.http.get<{
      success: boolean;
      message: string;
      balance?: number;
      amount?: number;
      alreadyProcessed?: boolean;
      paymentStatus?: string;
    }>(`${this.apiUrl}/verify-payment?sessionId=${sessionId}`, {
      headers: this.getHeaders(),
    });
  }
}
