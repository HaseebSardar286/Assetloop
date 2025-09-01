import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../../../interfaces/bookings';

@Component({
  selector: 'app-asset-preview-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asset-preview-card.component.html',
  styleUrls: ['./asset-preview-card.component.css'],
})
export class AssetPreviewCardComponent {
  @Input() asset!: Booking;
}
