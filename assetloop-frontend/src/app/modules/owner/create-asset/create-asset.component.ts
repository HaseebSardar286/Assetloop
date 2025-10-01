import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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
    images: [],
    features: [],
    amenities: [],
  };

  imageFiles: File[] = [];
  categories = ['car', 'apartment', 'house', 'tool'];
  availableFeatures = ['AC', 'Parking', 'Wi-Fi', 'Kitchen', 'Pet-Friendly'];
  availableAmenities = ['Gym', 'Pool', 'Security', 'Laundry', '24/7 Support'];
  statuses = ['Active', 'Inactive'];

  constructor(private ownerService: OwnerService, private router: Router) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.imageFiles = Array.from(input.files).slice(0, 5); // Limit to 5 images
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
    const formData = new FormData();
    formData.append('name', this.asset.name);
    formData.append('address', this.asset.address);
    formData.append('description', this.asset.description);
    formData.append('price', Number(this.asset.price).toString());
    if (this.asset.startDate)
      formData.append('startDate', this.asset.startDate);
    if (this.asset.endDate) formData.append('endDate', this.asset.endDate);
    formData.append('availability', this.asset.availability);
    formData.append('status', this.asset.status);
    formData.append('category', this.asset.category);
    formData.append('capacity', Number(this.asset.capacity).toString());
    formData.append('features', JSON.stringify(this.asset.features));
    formData.append('amenities', JSON.stringify(this.asset.amenities));
    this.imageFiles.forEach((file) =>
      formData.append('images', file, file.name)
    );

    this.ownerService.createAsset(formData).subscribe({
      next: (response: AssetResponse) => {
        alert('Asset created successfully!');
        this.router.navigate(['/assets']);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to create asset');
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
    this.imageFiles = [];
  }

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
}
