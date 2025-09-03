import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';

@Component({
  selector: 'app-create-asset',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    OwnerSideBarComponent,
  ],
  templateUrl: './create-asset.component.html',
  styleUrls: ['./create-asset.component.css'],
})
export class CreateAssetComponent {
  asset = {
    name: '',
    address: '',
    description: '',
    price: '',
    startDate: '',
    endDate: '',
    status: 'available',
    category: 'car',
    capacity: '',
    images: [] as File[],
    features: [] as string[],
    amenities: [] as string[],
  };

  categories = ['car', 'apartment', 'house', 'tool'];
  availableFeatures = ['AC', 'Parking', 'Wi-Fi', 'Kitchen', 'Pet-Friendly'];
  availableAmenities = ['Gym', 'Pool', 'Security', 'Laundry', '24/7 Support'];

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.files) {
      this.asset.images = Array.from(input.files);
    } else {
      console.warn('Invalid file input target:', event.target);
    }
  }

  addFeature(feature: string) {
    if (feature && !this.asset.features.includes(feature)) {
      this.asset.features.push(feature);
    }
  }

  removeFeature(feature: string) {
    this.asset.features = this.asset.features.filter((f) => f !== feature);
  }

  toggleAmenity(amenity: string) {
    const index = this.asset.amenities.indexOf(amenity);
    if (index > -1) {
      this.asset.amenities.splice(index, 1);
    } else {
      this.asset.amenities.push(amenity);
    }
  }

  onSubmit() {
    const formData = {
      ...this.asset,
      images: this.asset.images.map((file) => file.name), // Store file names for mock
    };
    console.log('New Asset Submitted:', formData);
    alert('Asset created successfully! (Mock submission)');
    this.resetForm();
  }

  resetForm() {
    this.asset = {
      name: '',
      address: '',
      description: '',
      price: '',
      startDate: '',
      endDate: '',
      status: 'available',
      category: 'car',
      capacity: '',
      images: [],
      features: [],
      amenities: [],
    };
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
}
