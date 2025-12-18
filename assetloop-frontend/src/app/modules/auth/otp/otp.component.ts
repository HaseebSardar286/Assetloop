import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-otp',
  imports: [FormsModule, NgIf],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.css',
})
export class OtpComponent {
  otp: string = '';
  message: string | null = null;

  constructor(private router: Router) {}

  onSubmit() {
    // if (this.otp && this.otp.length === 6) {
    //   console.log('OTP submitted:', this.otp);
    //   // Add your OTP verification logic here
    // }
    this.router.navigate(['/auth/change-password']);
  }

  resendOtp() {
    console.log('Resend OTP');
    // Add your resend OTP logic here
    this.message = 'A new OTP has been sent to your email (demo).';
  }
}
