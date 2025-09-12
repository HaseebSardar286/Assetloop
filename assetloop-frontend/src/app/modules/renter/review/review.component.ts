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
  rating = 5;
  comment = '';
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private renterService: RenterService
  ) {}

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id');
  }

  submit(): void {
    if (!this.bookingId) return;
    this.loading = true;
    this.error = null;
    this.renterService
      .addReview(this.bookingId, this.rating, this.comment)
      .subscribe({
        next: () => {
          this.loading = false;
          alert('Review submitted');
          this.router.navigate(['/renter/booking-history']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Failed to submit review';
        },
      });
  }
}
