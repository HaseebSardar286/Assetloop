import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';
import { FormsModule } from '@angular/forms';
import { OwnerService } from '../../../services/owner.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faPen,
  faEye,
  faToggleOn,
  faToggleOff,
  faArrowUpRightFromSquare,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-my-listing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    OwnerSideBarComponent,
    FormsModule,
    FontAwesomeModule,
  ],
  templateUrl: './my-listing.component.html',
  styleUrls: ['./my-listing.component.css'],
})
export class MyListingsComponent {
  faPlus = faPlus;
  faPen = faPen;
  faEye = faEye;
  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;
  faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  faTrash = faTrash;

  selectedListing: any = null;

  assets: any[] = [];

  constructor(private ownerService: OwnerService) {}

  ngOnInit(): void {
    this.loadAssets();
  }

  get activeCount(): number {
    return this.assets.filter(
      (a) => (a.status || '').toLowerCase() === 'active'
    ).length;
  }

  saveChanges() {
    if (!this.selectedListing) return;
    const id = this.selectedListing.id || this.selectedListing._id;
    if (!id) {
      alert('Asset id missing, cannot update.');
      return;
    }
    const payload: any = {
      name: this.selectedListing.name,
      address: this.selectedListing.address,
      price: this.selectedListing.price,
      status: this.selectedListing.status,
    };
    this.ownerService.updateAsset(id, payload).subscribe({
      next: () => {
        this.loadAssets();
        this.closeModal();
      },
      error: () => {
        alert('Failed to update listing');
      },
    });
  }

  toggleStatus(asset: any) {
    const id = asset.id || asset._id;
    if (!id) {
      alert('Asset id missing, cannot toggle status.');
      return;
    }
    const next =
      (asset.status || '').toLowerCase() === 'active' ? 'Inactive' : 'Active';
    this.ownerService.updateAsset(id, { status: next }).subscribe({
      next: () => {
        asset.status = next;
      },
      error: () => alert('Failed to update status'),
    });
  }

  deleteAsset(asset: any) {
    const id = asset.id || asset._id;
    if (!id) {
      alert('Asset id missing, cannot delete.');
      return;
    }
    const confirmed = confirm(
      'Are you sure you want to delete this asset? All related bookings will also be removed.'
    );
    if (!confirmed) return;

    this.ownerService.deleteAsset(id).subscribe({
      next: () => {
        this.assets = this.assets.filter((a) => (a.id || a._id) !== id);
        if (this.selectedListing && (this.selectedListing.id === id || this.selectedListing._id === id)) {
          this.closeModal();
        }
        alert('Asset deleted successfully. Related bookings have been removed.');
      },
      error: (err) => {
        console.error('Failed to delete asset', err);
        alert(err?.error?.message || 'Failed to delete asset');
      },
    });
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
