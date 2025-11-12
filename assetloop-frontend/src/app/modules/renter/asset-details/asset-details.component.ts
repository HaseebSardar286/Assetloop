import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { RenterService } from '../../../services/renter.service';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-asset-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    RenterSideBarComponent,
  ],
  templateUrl: './asset-details.component.html',
  styleUrl: './asset-details.component.css',
})
export class AssetDetailsComponent {
  assetId: string | null = null;
  loading = false;
  error: string | null = null;
  asset: any = null;
  reviews: Array<{
    rating: number;
    comment?: string;
    createdAt: string;
    reviewer: string;
  }> = [];
  averageRating = 0;
  totalReviews = 0;

  // Expose Math to template
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private renterService: RenterService,
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.assetId = this.route.snapshot.paramMap.get('id');
    if (this.assetId) {
      this.loading = true;
      // Reuse all assets endpoint and pick the one by id for now
      this.renterService.getAllAssets({}).subscribe({
        next: (res) => {
          this.asset = (res.assets || []).find(
            (a: any) => a._id === this.assetId
          );
          if (!this.asset) {
            this.error = 'Asset not found';
          }
          if (this.assetId) {
            this.renterService.getAssetReviews(this.assetId).subscribe({
              next: (r) => {
                this.reviews = r.reviews || [];
                this.averageRating = r.averageRating || 0;
                this.totalReviews = r.totalReviews || 0;
              },
              error: () => {},
            });
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to load asset details';
          this.loading = false;
        },
      });
    }
  }

  addToFavourites(): void {
    if (!this.assetId) return;
    this.loading = true;
    this.renterService.addToFavourites(this.assetId).subscribe({
      next: () => {
        this.loading = false;
        alert('Added to favourites');
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to add to favourites';
      },
    });
  }

  addToCart(): void {
    if (!this.asset) return;
    this.renterService
      .addToCart({
        id: this.asset._id,
        name: this.asset.name,
        address: this.asset.address,
        pricePerNight: String(this.asset.price),
        description: this.asset.description,
        amenities: this.asset.amenities || [],
        imageUrl: this.asset.images?.[0] || '/images/download.jpg',
      })
      .subscribe({
        next: () => alert('Added to cart'),
        error: (err) =>
          alert(
            err?.error?.message || 'Failed to add to cart (login as renter?)'
          ),
      });
  }

  startChat(): void {
    if (!this.asset || !this.asset.owner) {
      alert('Asset owner information not available');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Please login to start a chat');
      return;
    }

    // Get or create conversation with the asset owner
    this.chatService.getOrCreateConversation(this.asset._id, this.asset.owner._id).subscribe({
      next: (response) => {
        // Navigate to chat with the conversation ID
        this.router.navigate(['/renter/chat'], { 
          queryParams: { conversationId: response.conversation._id } 
        });
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to start chat');
      }
    });
  }
}
