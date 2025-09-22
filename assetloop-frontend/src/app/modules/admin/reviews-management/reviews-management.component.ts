import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminService } from '../../../services/admin.service';
import { Review } from '../../../interfaces/review';

@Component({
  selector: 'app-reviews-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderComponent,
    AdminSidebarComponent,
  ],
  templateUrl: './reviews-management.component.html',
  styleUrls: ['./reviews-management.component.css'],
})
export class ReviewsManagementComponent implements OnInit {
  allReviews: Review[] = [];
  filteredReviews: Review[] = [];
  displayedReviews: Review[] = [];
  loading = true;
  error: string | null = null;
  searchTerm: string = '';
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;

  constructor(private router: Router, private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getAllReviews().subscribe({
      next: (data) => {
        this.allReviews = Array.isArray(data.reviews)
          ? data.reviews
          : Array.isArray(data)
          ? data
          : [];
        this.filteredReviews = this.allReviews;
        this.updatePagination();
        this.loading = false;
        if (this.allReviews.length === 0) {
          this.error = 'No reviews found';
        }
        console.log('Loaded reviews:', this.allReviews);
      },
      error: (err) => {
        console.error('Error fetching reviews:', err);
        this.error =
          err.status === 500
            ? `Server error: ${err.error?.message || 'Internal Server Error'}`
            : err.error?.message || 'Failed to load reviews';
        this.loading = false;
      },
    });
  }

  searchReviews(): void {
    const term = this.searchTerm.toLowerCase().trim();
    console.log('Search term:', term);
    if (!term) {
      this.filteredReviews = this.allReviews;
    } else {
      this.filteredReviews = this.allReviews.filter((review) => {
        const renterName = review.renter
          ? [
              review.renter.firstName || '',
              review.renter.middleName || '',
              review.renter.lastName || '',
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .trim()
          : '';
        const ownerName = review.owner
          ? [
              review.owner.firstName || '',
              review.owner.middleName || '',
              review.owner.lastName || '',
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .trim()
          : '';
        const rentalName = review.rental?.name
          ? review.rental.name.toLowerCase().trim()
          : '';
        const comment = review.comment
          ? review.comment.toLowerCase().trim()
          : '';
        return (
          renterName.includes(term) ||
          ownerName.includes(term) ||
          rentalName.includes(term) ||
          comment.includes(term)
        );
      });
    }
    console.log('Filtered reviews:', this.filteredReviews);
    this.currentPage = 1;
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredReviews = this.allReviews;
    this.currentPage = 1;
    this.updatePagination();
    console.log('Search cleared, showing all reviews:', this.filteredReviews);
  }

  deleteReview(reviewId: string): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.adminService.deleteReview(reviewId).subscribe({
        next: () => {
          this.allReviews = this.allReviews.filter((r) => r._id !== reviewId);
          this.searchReviews();
          console.log(`Review ${reviewId} deleted`);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to delete review';
          console.error('Error deleting review:', err);
        },
      });
    }
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedReviews = this.filteredReviews.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(
      this.filteredReviews.length / this.itemsPerPage
    );
    if (this.displayedReviews.length === 0 && this.currentPage > 1) {
      this.currentPage = Math.max(1, this.totalPages);
      this.updatePagination();
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  onLogout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    this.router.navigate(['/auth/login']);
  }
}
