import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { RenterService } from '../../../services/renter.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, RenterSideBarComponent, HeaderComponent, ReactiveFormsModule],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css'],
})
export class ReviewComponent implements OnInit {
  reviewForm: FormGroup;
  bookingId: string | null = null;
  assetName: string = '';
  error: string | null = null;

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
    this.bookingId = this.route.snapshot.paramMap.get('bookingId');
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

  submitReview(): void {
    if (this.reviewForm.valid && this.bookingId) {
      this.renterService.submitReview(this.bookingId, this.reviewForm.value).subscribe({
        next: () => {
          alert('Review submitted successfully!');
          this.router.navigate(['/renter/my-bookings']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to submit review';
          console.error('Error submitting review:', err);
        },
      });
    } else {
      this.error = 'Please fill in all required fields and provide a rating.';
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}
