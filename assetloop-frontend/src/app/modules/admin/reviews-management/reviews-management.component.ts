import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-reviews-management',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, AdminSidebarComponent],
  templateUrl: './reviews-management.component.html',
  styleUrls: ['./reviews-management.component.css'],
})
export class ReviewsManagementComponent {
  reviews = [
    {
      id: 1,
      reviewer: 'Ali Khan',
      listing: 'Toyota Camry',
      rating: 4,
      comment: 'Great car, smooth ride!',
      date: '2025-08-30 14:00',
    },
    {
      id: 2,
      reviewer: 'Sara Ahmed',
      listing: 'Apartment 2B',
      rating: 3,
      comment: 'Decent place, needs maintenance.',
      date: '2025-09-01 10:30',
    },
    {
      id: 3,
      reviewer: 'Omar Farooq',
      listing: 'House 3C',
      rating: 5,
      comment: 'Excellent property, highly recommend!',
      date: '2025-09-01 09:15',
    },
  ];

  constructor(private router: Router) {}

  onLogout() {
    this.router.navigate(['/auth/login']);
  }

  onNavigate(event: Event) {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      this.router.navigate([path]);
    }
  }

  deleteReview(reviewId: number) {
    this.reviews = this.reviews.filter((r) => r.id !== reviewId);
    console.log(`Review ${reviewId} deleted`);
  }
}
