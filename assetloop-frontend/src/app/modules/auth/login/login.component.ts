import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  user = {
    email: '',
    password: '',
    rememberMe: false,
  };

  constructor(private router: Router) {}

  onSubmit() {
    // Simulate login logic (replace with actual API call)
    if (!this.user.email || !this.user.password) {
      alert('Please fill all fields!');
      return;
    }

    this.router.navigate(['/renter/dashboard']);
  }
  onForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }

  register() {
    this.router.navigate(['/auth/register']);
  }
}
