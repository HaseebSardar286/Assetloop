import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  onSubmit() {
    // Simulate login logic (replace with actual API call)
    if (!this.user.email || !this.user.password) {
      alert('Please fill all fields!');
      return;
    }
    // Mock successful login (replace with real authentication)
    console.log('Login attempted:', this.user);
    // Add API call or navigation logic here if needed
  }
  onForgotPassword() {
    alert('Forgot Password feature coming soon!');
    // Add navigation to forgot password page if implemented
  }
}
