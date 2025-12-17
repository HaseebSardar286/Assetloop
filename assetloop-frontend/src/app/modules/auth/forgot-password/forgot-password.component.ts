import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  email: string = '';
  loading = false;
  message: string | null = null;
  error: string | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  onSubmit(form: NgForm) {
    if (form.invalid || !this.email) return;
    this.loading = true;
    this.error = null;
    this.message = null;

    this.http
      .post(`${environment.apiBaseUrl}/auth/forgot-password`, { email: this.email })
      .subscribe({
        next: () => {
          this.loading = false;
          this.message = 'If an account exists, we sent a reset link to your email.';
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Failed to request password reset';
        },
      });
  }

  onLogin() {
    this.router.navigate(['/auth/login']);
  }
}
