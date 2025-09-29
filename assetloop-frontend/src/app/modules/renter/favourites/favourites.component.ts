import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Booking } from '../../../interfaces/bookings';
import { HeaderComponent } from '../../../components/header/header.component';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { BookingItemComponent } from '../../../components/cards/booking-item/booking-item.component';
import { RenterService } from '../../../services/renter.service';

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    RenterSideBarComponent,
    BookingItemComponent,
  ],
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.css'],
})
export class FavouritesComponent implements OnInit {
  favouriteItems: Booking[] = [];
  loading = false;
  error: string | null = null;

  likedCounts: { [key: string]: number } = {
    1: 15,
    2: 8,
  };

  constructor(private router: Router, private renterService: RenterService) {}

  ngOnInit(): void {
    this.loadFavourites();
  }

  loadFavourites() {
    this.loading = true;
    this.error = null;
    this.renterService.getFavourites().subscribe({
      next: (items: Booking[]) => {
        // Items come as simplified Booking-like entries from backend
        this.favouriteItems = items.map((item) => ({
          ...item,
          id: item.id || item._id || '',
          imageUrl: item.imageUrl || '/images/download.jpg',
          startDate: item.startDate || new Date(),
          endDate: item.endDate || new Date(),
          status: item.status || 'pending',
          owner: item.owner || { name: '', contact: '' },
        })) as Booking[];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load favourites';
        this.loading = false;
      },
    });
  }

  removeFavourite(id: string) {
    this.renterService.removeFromFavourites(id).subscribe({
      next: () => {
        this.favouriteItems = this.favouriteItems.filter(
          (item) => item.id !== id
        );
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to remove favourite';
      },
    });
  }

  addToCart(id: string) {
    const fav = this.favouriteItems.find((f) => f.id === id);
    if (!fav) return;
    this.renterService.addToCart({
      id: fav.id,
      name: fav.name,
      address: fav.address || '',
      pricePerNight: String(fav.price || fav.totalPaid || 0),
      description: fav.description || '',
      amenities: [],
      imageUrl: fav.imageUrl || '',
    });
    alert('Added to cart');
  }

  share(id: string) {
    console.log(`Sharing item ${id} via WhatsApp/Email/Copy Link`);
  }

  updateNotes(event: { id: string; notes: string }) {
    const item = this.favouriteItems.find((b) => b.id === event.id);
    if (item) item.notes = event.notes;
  }

  viewDetails(id: string) {
    this.router.navigate([`/renter/asset/${id}`]);
  }

  onNavigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.router.navigate(['/auth/login']);
  }
}
