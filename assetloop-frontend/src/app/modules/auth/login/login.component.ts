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

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    // Simulate login logic (replace with actual API call)
    if (!this.user.email || !this.user.password) {
      alert('Please fill all fields!');
      return;
    }
    this.authService.login(this.user).subscribe({
      next: (res) => {
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
              alert('Unknown role');
            }
          }
        } else {
          alert('Login failed. Invalid response from server.');
        }
      },
      error: (err) => {
        console.error('Login failed with error:', err);
        alert(err.error?.message || 'Login failed due to an unknown error');
      },
    });
  }
  onForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }

  register() {
    this.router.navigate(['/auth/register']);
  }
}
