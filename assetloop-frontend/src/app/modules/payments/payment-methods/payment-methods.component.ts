import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethod } from '../../../interfaces/payments';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.css'],
})
export class PaymentMethodsComponent {
  paymentMethods: PaymentMethod[] = [
    { id: 1, type: 'card', details: '****1234', isDefault: true },
    { id: 2, type: 'bank', details: 'Bank of Punjab', isDefault: false },
    { id: 3, type: 'wallet', details: 'Easypaisa', isDefault: false },
  ];
}
