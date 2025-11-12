import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { RenterService } from '../../../services/renter.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    RenterSideBarComponent,
  ],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css'],
})
export class ReviewComponent {
  bookingId: string | null = null;
  rating = 0;
  hoveredRating = 0;
  comment = '';
  loading = false;
  error: string | null = null;
  success = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private renterService: RenterService
  ) {}

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id');
  }

  setRating(rating: number): void {
    this.rating = rating;
  }

  setHoveredRating(rating: number): void {
    this.hoveredRating = rating;
  }

  clearHoveredRating(): void {
    this.hoveredRating = 0;
  }

  getStarClass(starNumber: number): string {
    const activeRating = this.hoveredRating || this.rating;
    if (starNumber <= activeRating) {
      return 'star-filled';
    }
    return 'star-empty';
  }

  submit(): void {
    if (!this.bookingId) {
      this.error = 'Booking ID is missing';
      return;
    }

    if (this.rating === 0) {
      this.error = 'Please select a rating';
      return;
    }

    if (!this.comment.trim()) {
      this.error = 'Please write a comment';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = false;

    this.renterService
      .addReview(this.bookingId, this.rating, this.comment.trim())
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          setTimeout(() => {
            // Navigate back to my-bookings page
            this.router.navigate(['/renter/booking-history']).then(() => {
              // Reload the page to refresh bookings list
              window.location.reload();
            });
          }, 1500);
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Failed to submit review. Please try again.';
        },
      });
  }

  cancel(): void {
    // Navigate back to my-bookings
    this.router.navigate(['/renter/booking-history']);
  }
}
