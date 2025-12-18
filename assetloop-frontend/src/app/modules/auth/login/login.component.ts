import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginForm } from '../../../interfaces/user';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  user: LoginForm = {
    email: '',
    password: '',
    rememberMe: false,
  };

  loading = false;
  error: string | null = null;
  showPassword = false;

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    if (this.loading) return;

    // Basic front-end validation
    if (!this.user.email || !this.user.password) {
      this.error = 'Please fill in both email and password.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.login(this.user).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.user) {
          const token = res.token;
          if (token) {
            localStorage.setItem('authToken', token);
            const decoded = this.authService.decodeToken(token);
            const role = decoded?.role; // Single role
            if (role === 'renter') {
              this.router.navigate(['/renter/dashboard']);
            } else if (role === 'owner') {
              this.router.navigate(['/owner/dashboard']);
            } else if (role === 'admin') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.error = 'Unknown role returned from server.';
            }
          }
        } else {
          this.error = 'Login failed. Invalid response from server.';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Login failed with error:', err);
        this.error =
          err.error?.message || 'Login failed due to an unknown error.';
      },
    });
  }
  onForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }

  register() {
    this.router.navigate(['/auth/register']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
