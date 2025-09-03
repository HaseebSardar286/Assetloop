import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';

@Component({
  selector: 'app-owner-profile',
  imports: [FormsModule, CommonModule, OwnerSideBarComponent, HeaderComponent],
  templateUrl: './owner-profile.component.html',
  styleUrl: './owner-profile.component.css',
})
export class OwnerProfileComponent {
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
