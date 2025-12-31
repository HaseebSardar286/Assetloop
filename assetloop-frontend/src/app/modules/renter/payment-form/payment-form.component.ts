import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCreditCard, faCalendar, faUser, faLock, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { HeaderComponent } from '../../../components/header/header.component';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { PaymentsService } from '../../../services/payments.service';
import { AuthService } from '../../../services/auth.service';
import { PaymentMethod } from '../../../interfaces/payments';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    HeaderComponent,
    RenterSideBarComponent,
  ],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.css',
})
export class PaymentFormComponent implements OnInit {
  faCreditCard = faCreditCard;
  faCalendar = faCalendar;
  faUser = faUser;
  faLock = faLock;
  faLocationDot = faLocationDot;

  paymentForm: FormGroup;
  loading = false;
  success = false;
  error: string | null = null;
  methods: PaymentMethod[] = [];

  constructor(
    private fb: FormBuilder,
    private paymentsService: PaymentsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.paymentForm = this.fb.group({
      cardName: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(19)]],
      expiry: ['', Validators.required],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
      country: ['', Validators.required],
      postal: ['', Validators.required],
      saveCard: [true],
    });
  }

  ngOnInit(): void {
    this.loadMethods();
  }

  loadMethods(): void {
    this.paymentsService.getPaymentMethods().subscribe({
      next: (m) => {
        this.methods = m;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load payment methods';
      },
    });
  }

  submit(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      this.error = 'Please complete required fields.';
      return;
    }
    this.loading = true;
    this.error = null;

    const { cardName, cardNumber, expiry, country, postal, saveCard } =
      this.paymentForm.value;
    const brand = this.inferBrand(cardNumber || '');

    this.paymentsService
      .addPaymentMethod({
        type: 'card',
        details: `${brand.toUpperCase()} •••• ${String(cardNumber).slice(-4)}`,
        brand,
        last4: String(cardNumber).slice(-4),
        expMonth: this.parseExpiry(expiry).expMonth,
        expYear: this.parseExpiry(expiry).expYear,
        name: cardName,
        isDefault: saveCard,
      })
      .subscribe({
        next: (methods: PaymentMethod[]) => {
          this.methods = methods;
          this.success = true;
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to save payment method';
          this.loading = false;
        },
      });
  }

  parseExpiry(expiry: string): { expMonth: number; expYear: number } {
    const [m, y] = String(expiry).split('/').map((v) => v.trim());
    const expMonth = Number(m);
    const expYear = Number(y?.length === 2 ? `20${y}` : y);
    return { expMonth, expYear };
  }

  inferBrand(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.startsWith('4')) return 'visa';
    if (digits.startsWith('5')) return 'mastercard';
    if (digits.startsWith('3')) return 'amex';
    if (digits.startsWith('6')) return 'discover';
    return 'card';
  }

  setDefault(id: string | number): void {
    this.paymentsService.setDefaultPaymentMethod(id).subscribe({
      next: (res) => {
        this.methods = res.methods || this.methods;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to set default';
      },
    });
  }

  remove(id: string | number): void {
    this.paymentsService.removePaymentMethod(id).subscribe({
      next: (res) => {
        this.methods = res.methods || this.methods.filter((m) => m.id !== id);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to remove method';
      },
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}
