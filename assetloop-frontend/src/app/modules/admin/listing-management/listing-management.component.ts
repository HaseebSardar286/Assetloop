import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminService } from '../../../services/admin.service';
import { AssetResponse } from '../../../interfaces/asset';

@Component({
  selector: 'app-listing-management',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, AdminSidebarComponent],
  templateUrl: './listing-management.component.html',
  styleUrls: ['./listing-management.component.css'],
})
export class ListingManagementComponent implements OnInit {
  listings: AssetResponse[] = [];
  loading = true;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getAssets().subscribe({
      next: (data) => {
        this.listings = data.assets;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load listings';
        this.loading = false;
      },
    });
  }

  onLogout(): void {
    localStorage.removeItem('authToken');
    window.location.href = '/auth/login';
  }

  onNavigate(event: Event): void {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      console.log('Navigating to:', path);
    }
  }

  deleteListing(listingId: string): void {
    if (confirm('Are you sure you want to delete this listing?')) {
      this.adminService.deleteAsset(listingId).subscribe({
        next: () => {
          this.listings = this.listings.filter((l) => l._id !== listingId);
          console.log(`Listing ${listingId} deleted`);
        },
        error: (err: { error: { message: string } }) => {
          this.error = err.error?.message || 'Failed to delete listing';
        },
      });
    }
  }

  // Pagination methods
  get paginatedListings(): AssetResponse[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.listings.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.listings.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
