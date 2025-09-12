import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';
import { AssetForm, AssetResponse } from '../../../interfaces/asset';
import { OwnerService } from '../../../services/owner.service';

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
  asset: AssetForm = {
    name: '',
    address: '',
    description: '',
    price: '',
    startDate: '',
    endDate: '',
    availability: 'available',
    status: 'Active',
    category: 'car',
    capacity: '',
    images: [], // Will hold base64 strings
    features: [],
    amenities: [],
  };

  categories = ['car', 'apartment', 'house', 'tool'];
  availableFeatures = ['AC', 'Parking', 'Wi-Fi', 'Kitchen', 'Pet-Friendly'];
  availableAmenities = ['Gym', 'Pool', 'Security', 'Laundry', '24/7 Support'];
  statuses = ['Active', 'Inactive'];

  constructor(private ownerService: OwnerService) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.files) {
      this.convertFilesToBase64(input.files);
    } else {
      console.warn('Invalid file input target:', event.target);
    }
  }

  convertFilesToBase64(files: FileList) {
    this.asset.images = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        this.asset.images.push(base64String);
      };
      reader.readAsDataURL(file);
    });
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
    const assetData: AssetForm = {
      ...this.asset,
      price: Number(this.asset.price),
      capacity: Number(this.asset.capacity),
    };
    console.log('Sending assetData:', assetData); // Add this line

    this.ownerService.createAsset(assetData).subscribe({
      next: (response: AssetResponse) => {
        alert('Asset created successfully!');
        this.resetForm();
      },
      error: (err) => {
        console.error('Error creating asset:', err);
        alert(err.error?.message || err.message || 'Failed to create asset');
      },
    });
  }

  resetForm() {
    this.asset = {
      name: '',
      address: '',
      description: '',
      price: '',
      startDate: '',
      endDate: '',
      availability: 'available',
      status: 'Active',
      category: 'car',
      capacity: '',
      images: [],
      features: [],
      amenities: [],
    };
  }

  onLogout() {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }

  onNavigate(event: Event) {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      console.log('Navigating to:', path);
    }
  }
}
