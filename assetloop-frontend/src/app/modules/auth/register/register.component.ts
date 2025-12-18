import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterForm, User } from '../../../interfaces/user';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user: RegisterForm = {
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'renter',
    terms: false,
    country: '',
    city: '',
    address: '',
    confirmPassword: '',
    _id: '',
    verificationStatus: 'pending',
  };

  loading = false;
  error: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

  countries: string[] = ['Pakistan', 'India', 'United States', 'UK', 'Canada'];
  selectedCountry: string | null = null;
  cities: string[] = [];
  selectedCity: string | null = null;

  allCities: any = {
    Pakistan: ['Lahore', 'Karachi', 'Islamabad'],
    India: ['Delhi', 'Mumbai', 'Bangalore'],
    United_States: ['New York', 'Los Angeles', 'Chicago'],
    UK: ['London', 'Manchester', 'Birmingham'],
    Canada: ['Toronto', 'Vancouver', 'Montreal'],
  };

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    if (this.loading) return;

    if (this.user.password !== this.user.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    if (
      !this.user.firstName ||
      !this.user.lastName ||
      !this.user.email ||
      !this.user.password ||
      !this.user.role ||
      !this.user.terms
    ) {
      this.error = 'Please fill all required fields and agree to the terms.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.register(this.user).subscribe({
      next: (res) => {
        this.loading = false;
        const pendingUserId = res?.pendingUserId;
        this.router.navigate(['/auth/verification'], {
          queryParams: { pendingUserId },
        });
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err.error?.message || 'Registration failed. Please try again.';
      },
    });
  }

  onCountryChange(country: string) {
    this.cities = this.allCities[country.replace(/\s+/g, '_')] || [];
    this.user.country = country;
  }

  onCityChange(city: string) {
    this.user.city = city;
  }

  login() {
    this.router.navigate(['/auth/login']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
