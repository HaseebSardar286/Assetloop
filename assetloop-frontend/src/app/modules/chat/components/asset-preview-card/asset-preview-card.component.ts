import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AssetPreview {
  _id: string;
  name: string;
  address: string;
  price: number;
  images: string[];
  category: string;
}

@Component({
  selector: 'app-asset-preview-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asset-preview-card.component.html',
  styleUrls: ['./asset-preview-card.component.css'],
})
export class AssetPreviewCardComponent {
  @Input() asset!: AssetPreview;

  getImageUrl(): string {
    if (this.asset?.images && this.asset.images.length > 0) {
      return this.asset.images[0];
    }
    return '/images/download.jpg';
  }
}
