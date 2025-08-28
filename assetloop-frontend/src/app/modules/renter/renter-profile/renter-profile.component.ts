import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'app-renter-profile',
  imports: [FormsModule, CommonModule, RenterSideBarComponent, HeaderComponent],
  templateUrl: './renter-profile.component.html',
  styleUrl: './renter-profile.component.css',
})
export class RenterProfileComponent {
  profile = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@buyer.com',
    phoneNumber: '',
    bio: 'Tell us a bit about yourself...',
  };

  accountStatus = {
    memberSince: 'January 2025',
    bookings: 2,
    reviews: 1,
  };

  constructor(private router: Router) {}

  onSaveChanges() {
    console.log('Profile saved:', this.profile);
    // Add your save logic here
  }

  onLogout() {
    this.router.navigate(['/auth/login']);
  }
}
