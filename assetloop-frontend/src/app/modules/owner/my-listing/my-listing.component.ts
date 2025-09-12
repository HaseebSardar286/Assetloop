import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';
import { FormsModule } from '@angular/forms';
import { OwnerService } from '../../../services/owner.service';

@Component({
  selector: 'app-my-listing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    OwnerSideBarComponent,
    FormsModule,
  ],
  templateUrl: './my-listing.component.html',
  styleUrls: ['./my-listing.component.css'],
})
export class MyListingsComponent {
  // listings = [
  //   {
  //     id: 1,
  //     name: 'Toyota Camry',
  //     address: '123 Main St, Karachi',
  //     status: 'available',
  //     price: 5000,
  //   },
  //   {
  //     id: 2,
  //     name: 'Apartment 2B',
  //     address: '456 Park Ave, Lahore',
  //     status: 'unavailable',
  //     price: 8000,
  //   },
  //   {
  //     id: 3,
  //     name: 'House 3C',
  //     address: '789 Hill Rd, Islamabad',
  //     status: 'available',
  //     price: 12000,
  //   },
  // ];

  selectedListing: any = null;

  assets: any[] = [];

  constructor(private ownerService: OwnerService) {}

  ngOnInit(): void {
    this.loadAssets();
  }

  loadAssets() {
    this.ownerService.getAssets().subscribe({
      next: (data) => {
        this.assets = data;
        console.log('My assets are: ', this.assets);
      },
      error: (error: String) => {
        console.log('Error loading Assets: ', error),
          alert('Failed to load Assets');
      },
    });
  }

  onLogout() {
    // Handle logout
  }

  onNavigate(event: Event) {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      console.log('Navigating to:', path);
    }
  }

  // toggleAvailability(listingId: number) {
  //   const listing = this.listings.find((l) => l.id === listingId);
  //   if (listing) {
  //     listing.status =
  //       listing.status === 'available' ? 'unavailable' : 'available';
  //     console.log(`Listing ${listingId} status updated to ${listing.status}`);
  //   }
  // }

  openModal(listing: any) {
    this.selectedListing = { ...listing };
  }

  // saveChanges() {
  //   if (this.selectedListing) {
  //     const listing = this.listings.find(
  //       (l) => l.id === this.selectedListing.id
  //     );
  //     if (listing) {
  //       Object.assign(listing, this.selectedListing);
  //       console.log(`Listing ${listing.id} updated:`, listing);
  //     }
  //     this.selectedListing = null;
  //   }
  // }

  closeModal() {
    this.selectedListing = null;
  }
}
