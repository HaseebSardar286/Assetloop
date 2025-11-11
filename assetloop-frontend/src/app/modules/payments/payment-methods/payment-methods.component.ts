import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethod } from '../../../interfaces/payments';
import { FormsModule } from '@angular/forms';
import { PaymentsService } from '../../../services/payments.service';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.css'],
})
export class PaymentMethodsComponent {
  paymentMethods: PaymentMethod[] = [];
  loading = false;
  error: string | null = null;
  info: string | null = null;

  // simple inline form model
  newMethod: {
    type: PaymentMethod['type'];
    details: string;
    isDefault?: boolean;
  } = {
    type: 'card',
    details: '',
    isDefault: false,
  };

  constructor(private paymentsService: PaymentsService) {
    this.loadMethods();
  }

  get hasDefault(): boolean {
    return this.paymentMethods.some((m) => m.isDefault);
  }

  loadMethods(): void {
    this.loading = true;
    this.error = null;
    this.info = null;
    this.paymentsService.getPaymentMethods().subscribe({
      next: (methods) => {
        this.paymentMethods = methods || [];
        if (!this.paymentMethods.length) {
          this.info = 'You have no saved payment methods.';
        } else if (!this.hasDefault) {
          this.info =
            'No default method set. Please choose a default for faster checkout.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load payment methods';
        this.loading = false;
      },
    });
  }

  setDefault(method: PaymentMethod): void {
    this.loading = true;
    this.error = null;
    this.info = null;
    this.paymentsService.setDefaultPaymentMethod(method.id).subscribe({
      next: () => {
        this.paymentMethods = this.paymentMethods.map((m) => ({
          ...m,
          isDefault: m.id === method.id,
        }));
        this.info = 'Default payment method updated.';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to set default method';
        this.loading = false;
      },
    });
  }

  remove(method: PaymentMethod): void {
    if (!confirm('Remove this payment method?')) return;
    this.loading = true;
    this.error = null;
    this.info = null;
    this.paymentsService.removePaymentMethod(method.id).subscribe({
      next: () => {
        this.paymentMethods = this.paymentMethods.filter(
          (m) => m.id !== method.id
        );
        if (!this.paymentMethods.length) {
          this.info =
            'You removed your last method. Add a new one to continue.';
        } else if (!this.hasDefault) {
          this.info =
            'No default method set. Please choose a default for faster checkout.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to remove method';
        this.loading = false;
      },
    });
  }

  add(): void {
    if (!this.newMethod.details?.trim()) {
      this.error = 'Please provide method details';
      return;
    }
    this.loading = true;
    this.error = null;
    this.info = null;
    this.paymentsService.addPaymentMethod(this.newMethod).subscribe({
      next: (created) => {
        if (created.isDefault) {
          this.paymentMethods = this.paymentMethods.map((m) => ({
            ...m,
            isDefault: false,
          }));
        }
        this.paymentMethods = [created, ...this.paymentMethods];
        this.newMethod = { type: 'card', details: '', isDefault: false };
        this.info = 'Payment method added.';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to add payment method';
        this.loading = false;
      },
    });
  }
}
