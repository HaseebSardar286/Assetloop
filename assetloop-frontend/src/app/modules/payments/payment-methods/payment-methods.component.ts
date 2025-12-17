import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethod } from '../../../interfaces/payments';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentsService } from '../../../services/payments.service';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.css'],
})
export class PaymentMethodsComponent {
  paymentMethods: PaymentMethod[] = [];
  loading = false;
  error: string | null = null;
  info: string | null = null;

  paymentForm: FormGroup;

  constructor(
    private paymentsService: PaymentsService,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      type: ['card', [Validators.required]],
      cardName: [''],
      cardNumber: [''],
      expiry: [''],
      walletProvider: [''],
      walletAccount: [''],
      walletName: [''],
      isDefault: [false],
    });
    this.setupConditionalValidation();
    this.loadMethods();
  }

  setupConditionalValidation(): void {
    // Watch for type changes and update validators accordingly
    this.paymentForm.get('type')?.valueChanges.subscribe((type) => {
      const cardNameControl = this.paymentForm.get('cardName');
      const cardNumberControl = this.paymentForm.get('cardNumber');
      const expiryControl = this.paymentForm.get('expiry');
      const walletProviderControl = this.paymentForm.get('walletProvider');
      const walletAccountControl = this.paymentForm.get('walletAccount');
      const walletNameControl = this.paymentForm.get('walletName');

      if (type === 'card') {
        // Set card validators
        cardNameControl?.setValidators([Validators.required]);
        cardNumberControl?.setValidators([Validators.required, this.cardNumberValidator]);
        expiryControl?.setValidators([Validators.required, this.expiryValidator]);
        // Clear wallet validators
        walletProviderControl?.clearValidators();
        walletAccountControl?.clearValidators();
        walletNameControl?.clearValidators();
      } else if (type === 'wallet') {
        // Set wallet validators
        walletProviderControl?.setValidators([Validators.required]);
        walletAccountControl?.setValidators([Validators.required, Validators.minLength(10)]);
        walletNameControl?.setValidators([Validators.required]);
        // Clear card validators
        cardNameControl?.clearValidators();
        cardNumberControl?.clearValidators();
        expiryControl?.clearValidators();
      }

      // Update validity
      cardNameControl?.updateValueAndValidity({ emitEvent: false });
      cardNumberControl?.updateValueAndValidity({ emitEvent: false });
      expiryControl?.updateValueAndValidity({ emitEvent: false });
      walletProviderControl?.updateValueAndValidity({ emitEvent: false });
      walletAccountControl?.updateValueAndValidity({ emitEvent: false });
      walletNameControl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  get paymentType(): string {
    return this.paymentForm.get('type')?.value || 'card';
  }

  cardNumberValidator = (control: any) => {
    if (!control.value) return null;
    // Extract only digits (handles formatted numbers with spaces)
    const digits = control.value.replace(/\D/g, '');
    
    // Accept any card number with 12-19 digits (including test/dummy cards)
    // Common test cards: 4242 4242 4242 4242 (Visa), 5555 5555 5555 4444 (Mastercard), etc.
    if (digits.length < 12 || digits.length > 19) {
      return { invalidCardNumber: true };
    }
    
    // Basic Luhn algorithm check (optional - can be skipped for test cards)
    // For now, we'll accept any 12-19 digit number to allow dummy/test cards
    return null;
  };

  expiryValidator = (control: any) => {
    if (!control.value) return null;
    const match = control.value.match(/^(\d{2})\/(\d{2,4})$/);
    if (!match) {
      return { invalidExpiry: true };
    }
    const month = parseInt(match[1], 10);
    const year = parseInt(match[2].length === 2 ? `20${match[2]}` : match[2], 10);
    const currentYear = new Date().getFullYear();
    if (month < 1 || month > 12 || year < currentYear) {
      return { invalidExpiry: true };
    }
    return null;
  };

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
      next: (res) => {
        if (res.methods) {
          this.paymentMethods = res.methods;
        } else {
          this.paymentMethods = this.paymentMethods.map((m) => ({
            ...m,
            isDefault: m.id === method.id,
          }));
        }
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
      next: (res) => {
        if (res.methods) {
          this.paymentMethods = res.methods;
        } else {
          this.paymentMethods = this.paymentMethods.filter(
            (m) => m.id !== method.id
          );
        }
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
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      this.error = 'Please complete all required fields correctly.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.info = null;

    const { type, cardName, cardNumber, expiry, walletProvider, walletAccount, walletName, isDefault } = this.paymentForm.value;
    
    let payload: any;
    
    if (type === 'wallet') {
      // Prepare wallet payload
      payload = {
        type: 'wallet',
        walletProvider,
        walletAccount: walletAccount.replace(/\D/g, ''), // Remove non-digits
        walletName,
        isDefault: isDefault || false,
      };
    } else {
      // Prepare card payload
      const brand = this.inferBrand(cardNumber || '');
      payload = {
        type: 'card',
        cardNumber: cardNumber.replace(/\D/g, ''), // Remove non-digits
        cardName,
        expiry,
        brand,
        isDefault: isDefault || false,
      };
    }

    // Send the data in the format the backend expects
    this.paymentsService.addPaymentMethod(payload as any).subscribe({
      next: (methods) => {
        // Backend returns full list
        if (Array.isArray(methods)) {
          this.paymentMethods = methods;
        } else {
          const created = methods as any as PaymentMethod;
          if (created.isDefault) {
            this.paymentMethods = this.paymentMethods.map((m) => ({
              ...m,
              isDefault: false,
            }));
          }
          this.paymentMethods = [created, ...this.paymentMethods];
        }
        this.paymentForm.reset({
          type: 'card',
          cardName: '',
          cardNumber: '',
          expiry: '',
          walletProvider: '',
          walletAccount: '',
          walletName: '',
          isDefault: false,
        });
        this.info = 'Payment method added successfully.';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to add payment method';
        this.loading = false;
      },
    });
  }

  inferBrand(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.startsWith('4')) return 'visa';
    if (digits.startsWith('5')) return 'mastercard';
    if (digits.startsWith('3')) return 'amex';
    if (digits.startsWith('6')) return 'discover';
    return 'card';
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Extract only digits
    let digits = input.value.replace(/\D/g, '');
    
    // Limit to 19 digits (max card length)
    if (digits.length > 19) {
      digits = digits.slice(0, 19);
    }
    
    // Format with spaces every 4 digits
    let formatted = '';
    if (digits.length > 0) {
      formatted = digits.match(/.{1,4}/g)?.join(' ') || digits;
    }
    
    // Update the form control value and trigger validation
    this.paymentForm.patchValue({ cardNumber: formatted }, { emitEvent: true });
    
    // Update the input value to show formatted number
    input.value = formatted;
  }

  formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 6);
    }
    this.paymentForm.patchValue({ expiry: value }, { emitEvent: false });
  }
}
