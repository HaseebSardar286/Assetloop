import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'app-renter-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RenterSideBarComponent,
    HeaderComponent,
  ],
  templateUrl: './renter-dashboard.component.html',
  styleUrl: './renter-dashboard.component.css',
})
export class RenterDashboardComponent {
  rentedItems = [
    { id: 1, name: 'Camera Lens', daysLeft: 3, price: '$50/day' },
    { id: 2, name: 'Drone', daysLeft: 7, price: '$100/day' },
  ];
  upcomingBookings = [
    { id: 1, item: 'Projector', date: 'Aug 20, 2025', status: 'Confirmed' },
    { id: 2, item: 'Tripod', date: 'Aug 25, 2025', status: 'Pending' },
  ];

  constructor(private router: Router) {}

  logout() {
    this.router.navigate(['/auth/login']);
  }

  goToHome() {
    this.router.navigate(['/renter/dashboard']);
  }
}
