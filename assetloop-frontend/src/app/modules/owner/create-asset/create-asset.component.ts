import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';
import { AssetForm, AssetResponse } from '../../../interfaces/asset';
import { OwnerService } from '../../../services/owner.service';
import { SystemSettingsService } from '../../../services/system-settings.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faCloudArrowUp,
  faCalendarDays,
  faTags,
  faListCheck,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-create-asset',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    OwnerSideBarComponent,
    FontAwesomeModule,
  ],
  templateUrl: './create-asset.component.html',
  styleUrls: ['./create-asset.component.css'],
})
export class CreateAssetComponent implements OnInit {
  faPlus = faPlus;
  faCloudArrowUp = faCloudArrowUp;
  faCalendarDays = faCalendarDays;
  faTags = faTags;
  faListCheck = faListCheck;
  faRotateRight = faRotateRight;

  asset: AssetForm = {
    name: '',
    address: '',
    description: '',
    price: '',
    startDate: '',
    endDate: '',
    availability: 'Available',
    status: 'Active',
    category: '',
    capacity: '',
    images: [],
    features: [],
    amenities: [],
  };

  imageFiles: File[] = [];
  categories = ['Car', 'Apartment', 'House', 'Tool', 'Electronics'];
  currentListingsCount: number = 0;
  maxListingsAllowed: number = 10;
  allowedFileTypes: string[] = ['jpg', 'png', 'pdf'];
  fileTypeError: string | null = null;
  availableFeatures = [
    // Cars
    'Air Conditioning',
    'Heated Seats',
    'Sunroof',
    'Bluetooth',
    'Apple CarPlay',
    'Android Auto',
    'Rear Camera',
    'Parking Sensors',
    'Cruise Control',
    'Alloy Wheels',
    'Roof Rack',
    // Apartments/Houses
    'Furnished',
    'Wi‑Fi',
    'Backup Power/UPS',
    'Inverter/Generator',
    'Smart Lock',
    'CCTV',
    'Intercom',
    'Elevator Access',
    'Balcony/Terrace',
    'Maid Room',
    'Store Room',
    // Tools/Equipment
    'Cordless',
    'High Torque',
    'Brushless Motor',
    'Water Resistant',
    'Heavy Duty',
    // Electronics
    '4K Display',
    'HDR',
    'Smart TV',
    'Noise Cancelling',
    'Dolby Atmos',
    'Wi‑Fi 6',
    // Event Gear
    'Battery Powered',
    'Portable',
    'Outdoor Rated',
  ];
  availableAmenities = [
    // Cars
    'Comprehensive Insurance',
    'Unlimited KM',
    'Roadside Assistance',
    'Child Seat',
    'Dash Cam',
    // Apartments/Houses
    'Gym',
    'Pool',
    'Security Guard',
    '24/7 CCTV',
    'Covered Parking',
    'Elevator',
    'RO/Filtered Water',
    'Gas Supply',
    'Air Conditioning',
    'Heating',
    'Laundry Room',
    'Dishwasher',
    'Pet Friendly',
    'Wheelchair Access',
    'Cleaning Service',
    'Solar Backup',
    // Tools/Equipment
    'Protective Gear Included',
    'Extra Blades/Bits',
    'Carrying Case',
    'On-site Support',
    // Electronics
    'HDMI/DisplayPort Cables',
    'Tripod/Stand',
    'Spare Batteries',
    'Fast Charger',
    // Event Gear
    'Delivery Available',
    'Setup Included',
    'On-site Technician',
    'Extension Cords',
  ];
  statuses = ['Active', 'Inactive'];

  constructor(
    private ownerService: OwnerService,
    private router: Router,
    private systemSettingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    // Load system settings and current listings count
    this.systemSettingsService.getSettings().subscribe({
      next: (settings) => {
        this.maxListingsAllowed = settings.maxListingsPerUser || 10;
        this.allowedFileTypes = settings.allowedFileTypes
          ? settings.allowedFileTypes.split(',').map(t => t.trim().toLowerCase())
          : ['jpg', 'png', 'pdf'];
      },
    });

    // Get current listings count
    this.ownerService.getAssets().subscribe({
      next: (assets) => {
        this.currentListingsCount = assets.length;
      },
      error: (err) => {
        console.error('Failed to load assets:', err);
      },
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.fileTypeError = null;
      const files = Array.from(input.files);
      
      // Validate file types
      const invalidFiles = files.filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return !ext || !this.allowedFileTypes.includes(ext);
      });

      if (invalidFiles.length > 0) {
        this.fileTypeError = `Invalid file types. Allowed types: ${this.allowedFileTypes.join(', ').toUpperCase()}`;
        return;
      }

      this.imageFiles = files.slice(0, 5); // Limit to 5 images
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

  onFeatureSelect(event: Event) {
    const selectEl = event.target as HTMLSelectElement | null;
    const value = selectEl?.value;
    if (value) {
      this.addFeature(value);
      if (selectEl) selectEl.value = '';
    }
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
    // Check listing limit before submission
    if (this.currentListingsCount >= this.maxListingsAllowed) {
      alert(`You have reached the maximum limit of ${this.maxListingsAllowed} listings per user.`);
      return;
    }

    // Validate file types
    if (this.imageFiles.length === 0) {
      alert('Please select at least one image.');
      return;
    }

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
        this.router.navigate(['/owner/assets']);
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
      availability: 'Available',
      status: 'Active',
      category: '',
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
