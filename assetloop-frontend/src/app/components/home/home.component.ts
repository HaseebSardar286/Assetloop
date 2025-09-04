import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Booking } from '../../interfaces/bookings';
import { ProductItemComponent } from '../cards/product-item/product-item.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faBell,
  faHeart,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';

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
  searchQuery: string = '';
  category: string = '';
  location: string = '';
  dates: string = '';
  minPrice: string = '';
  sort: string = '';

  assets: Booking[] = [
    {
      id: 1,
      name: '2-Bedroom Apartment in Lahore',
      address: 'DHA Phase 6, Lahore',
      dates: '2025-09-01 to 2025-09-05',
      total: 'PKR 5,000/day',
      status: 'available',
      imageUrl: '/images/download.jpg',
      category: 'Apartment',
    },
    {
      id: 2,
      name: 'Canon DSLR Camera',
      address: 'Karachi',
      dates: '2025-09-02 to 2025-09-06',
      total: 'PKR 2,000/day',
      status: 'available',
      imageUrl: '/images/download.jpg',
      category: 'Tool',
    },
    {
      id: 3,
      name: '3-Bedroom House in Islamabad',
      address: 'F-7, Islamabad',
      dates: '2025-09-03 to 2025-09-07',
      total: 'PKR 7,000/day',
      status: 'available',
      imageUrl: '/images/download.jpg',
      category: 'House',
    },
    {
      id: 4,
      name: 'Toyota Corolla 2019',
      address: 'Rawalpindi',
      dates: '2025-09-04 to 2025-09-08',
      total: 'PKR 3,000/day',
      status: 'available',
      imageUrl: '/images/download.jpg',
      category: 'Car',
    },
    {
      id: 5,
      name: 'Luxury Villa in Murree',
      address: 'Murree Hills',
      dates: '2025-09-05 to 2025-09-09',
      total: 'PKR 10,000/day',
      status: 'available',
      imageUrl: '/images/download.jpg',
      category: 'House',
    },
    {
      id: 6,
      name: 'DJI Drone',
      address: 'Lahore',
      dates: '2025-09-06 to 2025-09-10',
      total: 'PKR 1,500/day',
      status: 'available',
      imageUrl: '/images/download.jpg',
      category: 'Tool',
    },
  ];

  currentPage: number = 1;
  itemsPerPage: number = 6;
  searchForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      keywords: [''],
    });
  }

  get paginatedAssets(): Booking[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.assets.slice(start, start + this.itemsPerPage);
  }

  onBookNow(id: number) {
    console.log(`Booking asset with ID: ${id}`);
  }

  removeFavourite(id: number) {
    console.log(`Removed from favourites: ${id}`);
  }

  share(id: number) {
    console.log(`Sharing item ${id}`);
  }

  updateNotes(event: { id: number; notes: string }) {
    const asset = this.assets.find((a) => a.id === event.id);
    if (asset) asset.notes = event.notes;
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  applySearch() {
    console.log('Search applied:', this.searchForm.value);
  }
}
