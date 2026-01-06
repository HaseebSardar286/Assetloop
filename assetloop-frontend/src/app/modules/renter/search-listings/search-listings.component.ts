import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { ProductItemComponent } from '../../../components/cards/product-item/product-item.component';
import { RenterService } from '../../../services/renter.service';
import { AssetResponse } from '../../../interfaces/asset';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFilter,
  faRotateLeft,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-search-listings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    RenterSideBarComponent,
    HeaderComponent,
    ProductItemComponent,
    FontAwesomeModule,
  ],
  templateUrl: './search-listings.component.html',
  styleUrls: ['./search-listings.component.css'],
})
export class SearchListingsComponent implements OnInit {
  faFilter = faFilter;
  faRotateLeft = faRotateLeft;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  searchForm: FormGroup;
  allAssets: AssetResponse[] = [];
  filteredAssets: AssetResponse[] = [];
  displayedAssets: AssetResponse[] = [];
  pagination: { page: number; limit: number; totalPages: number } = {
    page: 1,
    limit: 10,
    totalPages: 0,
  };
  error: string | null = null;
  sortBy: string = 'recommended';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renterService: RenterService
  ) {
    this.searchForm = this.fb.group({
      keywords: [''],
      category: ['All Categories'],
      minPrice: [''],
      maxPrice: [''],
      availability: ['all'],
    });
  }

  favoritesSet: Set<string> = new Set();

  ngOnInit(): void {
    this.loadAssets();
    this.loadFavorites();
    this.searchForm.get('category')?.valueChanges.subscribe(() => this.applyFilters());
    this.searchForm.get('keywords')?.valueChanges.subscribe(() => this.applyFilters());
    this.searchForm.get('minPrice')?.valueChanges.subscribe(() => this.applyFilters());
    this.searchForm.get('maxPrice')?.valueChanges.subscribe(() => this.applyFilters());
    this.searchForm.get('availability')?.valueChanges.subscribe(() => this.applyFilters());
  }

  loadFavorites(): void {
    this.renterService.getFavourites().subscribe({
      next: (favs: any[]) => {
        // Handle different possible ID fields (id, _id, assetId)
        this.favoritesSet = new Set(favs.map(f => f.id || f._id || f.assetId));
      },
      error: (err) => console.error('Failed to load favorites', err)
    });
  }

  isAssetFavourite(assetId: string): boolean {
    return this.favoritesSet.has(assetId);
  }

  toggleFavourite(assetId: string): void {
    if (this.favoritesSet.has(assetId)) {
      this.renterService.removeFromFavourites(assetId).subscribe({
        next: () => {
          this.favoritesSet.delete(assetId);
          // Force change detection or wait for angular to detect set change if using pipe (but here we use method)
        },
        error: (err) => alert(err?.error?.message || 'Failed to remove from favourites')
      });
    } else {
      this.renterService.addToFavourites(assetId).subscribe({
        next: () => {
          this.favoritesSet.add(assetId);
        },
        error: (err) => alert(err?.error?.message || 'Failed to add to favourites')
      });
    }
  }

  loadAssets(): void {
    this.renterService.getAllAssets().subscribe({
      next: (response) => {
        this.allAssets = response.assets;
        this.applyFilters();
        this.error = null;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load assets';
      },
    });
  }

  applyFilters(): void {
    const { keywords, minPrice, maxPrice, category, availability } = this.searchForm.value;
    let filtered = [...this.allAssets];

    if (keywords) {
      const searchTerm = keywords.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchTerm) ||
          asset.description.toLowerCase().includes(searchTerm)
      );
    }

    if (category && category !== 'All Categories') {
      filtered = filtered.filter(
        (asset) => asset.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (availability && availability !== 'all') {
      filtered = filtered.filter(
        (asset) => asset.availability.toLowerCase() === availability.toLowerCase()
      );
    }

    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter((asset) => asset.price >= min);
      }
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter((asset) => asset.price <= max);
      }
    }

    if (this.sortBy === 'priceLowToHigh') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'priceHighToLow') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    this.filteredAssets = filtered;
    this.pagination.totalPages = Math.ceil(
      filtered.length / this.pagination.limit
    );
    this.pagination.page = 1;
    this.updateDisplayedAssets();
  }

  updateDisplayedAssets(): void {
    const start = (this.pagination.page - 1) * this.pagination.limit;
    const end = start + this.pagination.limit;
    this.displayedAssets = this.filteredAssets.slice(start, end);
  }

  clearFilters(): void {
    this.searchForm.reset({
      keywords: '',
      category: 'All Categories',
      minPrice: '',
      maxPrice: '',
      availability: 'all',
    });
    this.sortBy = 'recommended';
    this.applyFilters();
  }

  changeSort(event: Event): void {
    this.sortBy = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pagination.page = page;
      this.updateDisplayedAssets();
    }
  }

  viewDetails(assetId: string): void {
    this.router.navigate([`/renter/asset/${assetId}`]);
  }

  addToFavourites(assetId: string): void {
    this.toggleFavourite(assetId);
  }

  addToCart(asset: AssetResponse): void {
    this.renterService
      .addToCart({
        id: asset._id,
        name: asset.name,
        address: asset.address,
        pricePerDay: String(asset.price),
        description: asset.description,
        amenities: asset.amenities || [],
        imageUrl: asset.images?.[0] || '',
      })
      .subscribe({
        next: () => alert('Added to cart'),
        error: (err) =>
          alert(
            err?.error?.message || 'Failed to add to cart (login as renter?)'
          ),
      });
  }

  share(_id: string): void {
    // Placeholder for share logic
    alert('Share link copied!');
  }

  updateNotes(_evt: { id: string; notes: string }): void {
    // No-op in search listings context
  }

  logout(): void {
    this.router.navigate(['/auth/login']);
  }
}
