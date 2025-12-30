import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Booking } from '../../interfaces/bookings';
import { ProductItemComponent } from '../cards/product-item/product-item.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faBell,
  faHeart,
  faSearch,
  faCar,
  faBuilding,
  faHouse,
  faWrench,
  faMapMarkerAlt,
  faUsers,
  faCalendarAlt,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';
import { AssetResponse } from '../../interfaces/asset';
import { RenterService } from '../../services/renter.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ProductItemComponent,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  @Output() logout = new EventEmitter<void>();

  faUser = faUser;
  faBell = faBell;
  faHeart = faHeart;
  faSearch = faSearch;
  faCar = faCar;
  faBuilding = faBuilding;
  faHouse = faHouse;
  faWrench = faWrench;
  faMapMarkerAlt = faMapMarkerAlt;
  faUsers = faUsers;
  faCalendarAlt = faCalendarAlt;
  faCheckCircle = faCheckCircle;
  faFacebook = faFacebook;
  faTwitter = faTwitter;
  faInstagram = faInstagram;
  faLinkedin = faLinkedin;
  searchQuery: string = '';
  category: string = '';
  location: string = '';
  dates: string = '';
  minPrice: string = '';
  sort: string = '';

  assets: AssetResponse[] = [];

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
  currentYear: number = new Date().getFullYear();

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
      location: [''],
      availability: ['all'],
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit(): void {
    this.loadAssets();
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
    const {
      keywords,
      category,
      minPrice,
      maxPrice,
      location,
      availability,
      startDate,
      endDate,
    } = this.searchForm.value;
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

    if (location) {
      const locationTerm = location.toLowerCase();
      filtered = filtered.filter((asset) =>
        asset.address.toLowerCase().includes(locationTerm)
      );
    }

    if (availability && availability !== 'all') {
      filtered = filtered.filter(
        (asset) => asset.availability.toLowerCase() === availability.toLowerCase()
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((asset) => {
        if (!asset.startDate) return true;
        const assetStart = new Date(asset.startDate);
        return assetStart <= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter((asset) => {
        if (!asset.endDate) return true;
        const assetEnd = new Date(asset.endDate);
        return assetEnd >= end;
      });
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

  setCategory(category: string): void {
    this.searchForm.patchValue({ category });
    this.applyFilters();
    this.scrollToSection('asset-list');
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
      location: '',
      availability: 'all',
      startDate: '',
      endDate: '',
    });
    this.sortBy = 'recommended';
    this.applyFilters();
  }

  onBookNow(id: string) {
    console.log(`Booking asset with ID: ${id}`);
  }

  removeFavourite(id: string) {
    console.log(`Removed from favourites: ${id}`);
  }

  share(id: string) {
    console.log(`Sharing item ${id}`);
  }

  applySearch() {
    console.log('Search applied:', this.searchForm.value);
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
    this.router.navigate([`/asset/${assetId}`]);
  }

  scrollToSection(sectionId: string): void {
    if (typeof document === 'undefined') return;
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
