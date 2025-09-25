import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { Router } from '@angular/router';
import { RegisterForm, User } from '../../../interfaces/user';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor], // Add FormsModule here for template-driven forms
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

  countries: string[] = ['Pakistan', 'India', 'United States', 'UK', 'Canada'];
  selectedCountry: string | null = null;

  cities: string[] = [];
  selectedCity: string | null = null;

  allCities: any = {
    Pakistan: ['Lahore', 'Karachi', 'Islamabad'],
    India: ['Delhi', 'Mumbai', 'Bangalore'],
    United_States: ['New York', 'Los Angeles', 'Chicago'], // Adjusted key
    UK: ['London', 'Manchester', 'Birmingham'],
    Canada: ['Toronto', 'Vancouver', 'Montreal'],
  };

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (
      !this.user.firstName ||
      !this.user.email ||
      !this.user.password ||
      !this.user.role
    ) {
      alert('Please fill all required fields!');
      return;
    }

    this.authService.register(this.user).subscribe({
      next: (res) => {
        // Redirect to verification with pendingUserId to complete KYC
        const pendingUserId = res?.pendingUserId;
        this.router.navigate(['/auth/verification'], {
          queryParams: { pendingUserId },
        });
      },
      error: (err) => {
        alert(err.error.message || 'Registration failed. Please try again!');
      },
    });
  }

  onCountryChange(country: string) {
    this.cities = this.allCities[country.replace(/\s+/g, '_')] || []; // Handle spaces in country names
    this.user.country = country; // Update user object
  }

  onCityChange(city: string) {
    this.user.city = city; // Update user object
  }

  login() {
    this.router.navigate(['/auth/login']);
  }
}
