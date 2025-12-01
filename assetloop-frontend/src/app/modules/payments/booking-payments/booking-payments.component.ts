import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../../interfaces/payments';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentsService } from '../../../services/payments.service';
import { AuthService } from '../../../services/auth.service';
import { RenterService } from '../../../services/renter.service';
import { Booking } from '../../../interfaces/bookings';

@Component({
  selector: 'app-booking-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-payments.component.html',
  styleUrls: ['./booking-payments.component.css'],
})
export class BookingPaymentsComponent {
  upcomingPayments: Transaction[] = [];
  securityDeposit: number = 0;
  autoPay: boolean = false;

  bookingId: string | null = null;
  loading = false;
  error: string | null = null;
  booking: Booking | null = null;
  amountDue = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentsService: PaymentsService,
    private authService: AuthService,
    private renterService: RenterService
  ) {
    this.bookingId = this.route.snapshot.paramMap.get('id');
    this.loadBooking();
  }

  loadBooking(): void {
    if (!this.bookingId) {
      this.error = 'Invalid booking identifier';
      return;
    }
    this.loading = true;
    this.renterService.getBookings().subscribe({
      next: (bookings) => {
        this.booking = bookings.find(b => (b._id || b.id) === this.bookingId) || null;
        if (!this.booking) {
          this.error = 'Booking not found';
          this.loading = false;
        } else {
          const price = Number(this.booking.price) || 0;
          const paid = Number(this.booking.totalPaid) || 0;
          this.amountDue = Math.max(0, price - paid);

          // Fetch actual transactions for this booking
          this.paymentsService.getTransactions({ bookingId: this.bookingId! }).subscribe({
            next: (txns) => {
              // Combine past transactions with potential upcoming payment
              const pastPayments = txns.map(t => ({
                ...t,
                status: t.status === 'completed' ? 'successful' : t.status // Map status if needed
              })) as Transaction[];

              const upcoming = this.amountDue > 0 ? [{
                id: 'pending-1',
                amount: this.amountDue,
                status: 'pending',
                method: 'card',
                date: new Date().toISOString().slice(0, 10),
                type: 'payment',
                currency: 'usd'
              } as Transaction] : [];

              this.upcomingPayments = [...pastPayments, ...upcoming];
              this.loading = false;
            },
            error: (err) => {
              console.error('Failed to load transactions', err);
              // Fallback to just showing due amount
              this.upcomingPayments = this.amountDue > 0 ? [{
                id: 'pending-1',
                amount: this.amountDue,
                status: 'pending',
                method: 'card',
                date: new Date().toISOString().slice(0, 10),
                type: 'payment',
                currency: 'usd'
              } as Transaction] : [];
              this.loading = false;
            }
          });

          this.securityDeposit = 0;
        }
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load booking';
        this.loading = false;
      }
    });
  }

  payNow(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Please login to pay for the booking');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.bookingId) {
      alert('Invalid booking identifier');
      return;
    }

    this.loading = true;
    this.error = null;
    this.paymentsService
      .createCheckoutSession(this.bookingId, {
        // Use current app origin for success/cancel
        successUrl: window.location.origin + '/payments?status=success&bookingId=' + this.bookingId,
        cancelUrl: window.location.origin + '/payments?status=cancelled&bookingId=' + this.bookingId,
        currency: 'usd',
      })
      .subscribe({
        next: (resp) => {
          if (resp.url) {
            window.location.href = resp.url;
          } else {
            this.loading = false;
            this.error = 'Failed to initiate payment session';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Failed to create checkout session';
        },
      });
  }
}
