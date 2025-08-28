import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from '../../../components/footer/footer.component';
import { HeaderComponent } from '../../../components/header/header.component';
interface Listing {
  id: number;
  name: string;
  address: string;
  pricePerNight: string;
  description: string;
  amenities: string[];
  imageUrl: string;
}

@Component({
  selector: 'app-search-listings',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    RenterSideBarComponent,
    HeaderComponent,
  ],
  templateUrl: './search-listings.component.html',
  styleUrl: './search-listings.component.css',
})
export class SearchListingsComponent {
  searchForm: FormGroup;
  listings: Listing[] = [
    {
      id: 1,
      name: 'Cozy Downtown Apartment',
      address: '123 Main St, Cityville',
      pricePerNight: '$150/night',
      description:
        'A beautiful apartment in the heart of the city, perfect for short stays., WiFi, Kitchen, Air Conditioning',
      amenities: ['WiFi', 'Kitchen', 'Air Conditioning'],
      imageUrl: '/images/download.jpg',
    },
    {
      id: 2,
      name: 'Spacious Suburban House',
      address: '456 Oak Ave, Suburbia',
      pricePerNight: '$250/night',
      description:
        'Large house with a backyard, ideal for families., Kitchen, Parking',
      amenities: ['Kitchen', 'Parking'],
      imageUrl: '/images/download (1).jpg',
    },
    {
      id: 2,
      name: 'Spacious Suburban House',
      address: '456 Oak Ave, Suburbia',
      pricePerNight: '$250/night',
      description:
        'Large house with a backyard, ideal for families., Kitchen, Parking',
      amenities: ['Kitchen', 'Parking'],
      imageUrl: '/images/download (2).jpg',
    },
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.searchForm = this.fb.group({
      keywords: [''],
      category: ['All Categories'],
      minPrice: [''],
      maxPrice: [''],
    });
  }

  applyFilters() {
    console.log('Filters applied:', this.searchForm.value);
    // Add filter logic here
  }

  clearFilters() {
    this.searchForm.reset({
      keywords: '',
      category: 'All Categories',
      minPrice: '',
      maxPrice: '',
    });
  }

  viewDetails(listingId: number) {
    this.router.navigate([`/asset/${listingId}`]);
  }

  logout() {
    this.router.navigate(['/auth/login']);
  }
}
