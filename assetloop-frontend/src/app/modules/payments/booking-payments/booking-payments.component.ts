import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../../interfaces/payments';

@Component({
  selector: 'app-booking-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-payments.component.html',
  styleUrls: ['./booking-payments.component.css'],
})
export class BookingPaymentsComponent {
  upcomingPayments: Transaction[] = [
    {
      id: 1,
      amount: 2000,
      status: 'pending',
      method: 'card',
      date: '2025-09-01',
      type: 'rent',
    },
  ];
  securityDeposit: number = 500;
  autoPay: boolean = false;
}
