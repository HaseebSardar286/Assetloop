import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  imports: [FormsModule, NgIf],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (
      this.newPassword &&
      this.confirmPassword &&
      this.newPassword === this.confirmPassword &&
      this.newPassword.length >= 6
    ) {
      console.log('Password changed successfully:', this.newPassword);
      // Add your password change logic here
      // this.router.navigate(['/auth/login']);
    }
    this.router.navigate(['/auth/login']);
  }

  onLogin() {
    this.router.navigate(['/auth/login']);
  }
}
