import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminService } from '../../../services/admin.service';
import { AssetResponse } from '../../../interfaces/asset';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTrash,
  faLock,
  faUnlock,
  faEye,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-listing-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderComponent,
    AdminSidebarComponent,
    FontAwesomeModule,
  ],
  templateUrl: './listing-management.component.html',
  styleUrls: ['./listing-management.component.css'],
})
export class ListingManagementComponent implements OnInit {
  faTrash = faTrash;
  faLock = faLock;
  faUnlock = faUnlock;
  faEye = faEye;

  listings: AssetResponse[] = [];
  filteredListings: AssetResponse[] = [];
  loading = true;
  error: string | null = null;
  searchTerm: string = '';
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
        this.listings = data.assets || data;
        this.filteredListings = this.listings;
        this.loading = false;
        this.updatePagination();
        console.log('Loaded listings:', this.listings);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load listings';
        this.loading = false;
        console.error('Error loading listings:', err);
      },
    });
  }

  searchListings(): void {
    const term = this.searchTerm.toLowerCase().trim();
    console.log('Search term:', term); // Debug search term
    if (!term) {
      this.filteredListings = this.listings;
    } else {
      this.filteredListings = this.listings.filter((listing) => {
        const ownerName = listing.owner
          ? [
              listing.owner.firstName || '',
              listing.owner.middleName || '',
              listing.owner?.lastName || '',
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .trim()
          : '';
        const status = listing.status ? listing.status.toLowerCase() : '';
        const matches =
          (listing.name && listing.name.toLowerCase().includes(term)) ||
          ownerName.includes(term) ||
          status.includes(term);
        return matches;
      });
    }
    console.log('Filtered listings:', this.filteredListings); // Debug filtered results
    this.currentPage = 1; // Reset to first page on search
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredListings = this.listings;
    this.currentPage = 1;
    this.updatePagination();
    console.log('Search cleared, showing all listings:', this.filteredListings);
  }

  deleteListing(listingId: string): void {
    if (confirm('Are you sure you want to delete this listing?')) {
      this.adminService.deleteAsset(listingId).subscribe({
        next: () => {
          this.listings = this.listings.filter((l) => l._id !== listingId);
          this.searchListings(); // Reapply search and pagination
          console.log(`Listing ${listingId} deleted`);
        },
        error: (err: { error: { message: string } }) => {
          this.error = err.error?.message || 'Failed to delete listing';
          console.error('Error deleting listing:', err);
        },
      });
    }
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    // this.paginatedListings = this.filteredListings.slice(start, end);
  }

  get paginatedListings(): AssetResponse[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredListings.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredListings.length / this.itemsPerPage);
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
    window.location.href = '/auth/login';
  }

  onNavigate(event: Event): void {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      console.log('Navigating to:', path);
    }
  }
}
