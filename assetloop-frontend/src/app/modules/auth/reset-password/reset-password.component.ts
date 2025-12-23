import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  token: string | null = null;
  newPassword = '';
  confirmPassword = '';
  loading = false;
  message: string | null = null;
  error: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.error = 'Reset token is missing or invalid. Please request a new reset email.';
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid || !this.token) return;
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    this.loading = true;
    this.error = null;
    this.message = null;

    this.http
      .post(`${environment.apiBaseUrl}/auth/reset-password`, {
        token: this.token,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.message = 'Password reset successfully. You can now log in.';
          setTimeout(() => this.router.navigate(['/auth/login']), 1500);
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Failed to reset password';
        },
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}

