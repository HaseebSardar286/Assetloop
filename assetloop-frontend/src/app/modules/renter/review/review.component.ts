import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { RenterService } from '../../../services/renter.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, RenterSideBarComponent, HeaderComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css'],
})
export class ReviewComponent implements OnInit {
  reviewForm: FormGroup;
  bookingId: string | null = null;
  assetName: string = '';
  error: string | null = null;
  success: boolean = false;
  loading: boolean = false;
  rating: number = 0;
  hoveredRating: number = 0;
  comment: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private renterService: RenterService,
    private router: Router,
    private authService: AuthService
  ) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.bookingId =
      this.route.snapshot.paramMap.get('id') ||
      this.route.snapshot.paramMap.get('bookingId');
    if (this.bookingId) {
      this.renterService.getBookingDetails(this.bookingId).subscribe({
        next: (booking) => {
          this.assetName = booking.assetName || 'Unknown Asset';
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to load booking details';
          console.error('Error loading booking details:', err);
        },
      });
    } else {
      this.error = 'Booking ID not provided.';
    }
  }

  getStarClass(star: number): string {
    const active = this.hoveredRating > 0 ? this.hoveredRating : this.rating;
    return star <= active ? 'star-filled' : 'star-empty';
  }

  setRating(star: number): void {
    this.rating = star;
    this.reviewForm.get('rating')?.setValue(star);
  }

  setHoveredRating(star: number): void {
    this.hoveredRating = star;
  }

  clearHoveredRating(): void {
    this.hoveredRating = 0;
  }

  submit(): void {
    this.error = null;
    if (!this.bookingId) {
      this.error = 'Booking ID not provided.';
      return;
    }
    if (this.rating < 1 || this.rating > 5 || !this.comment.trim()) {
      this.error = 'Please provide a rating (1-5) and a review comment.';
      return;
    }
    this.loading = true;
    this.renterService
      .submitReview(this.bookingId, {
        rating: this.rating,
        comment: this.comment.trim(),
      })
      .subscribe({
        next: () => {
          this.success = true;
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/renter/my-bookings']);
          }, 1200);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Failed to submit review';
          console.error('Error submitting review:', err);
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/renter/my-bookings']);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
