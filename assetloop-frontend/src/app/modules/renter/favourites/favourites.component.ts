import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductItemComponent } from '../../../components/cards/product-item/product-item.component';
import { Booking } from '../../../interfaces/bookings';
import { HeaderComponent } from '../../../components/header/header.component';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductItemComponent,
    HeaderComponent,
    RenterSideBarComponent,
  ],
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.css'],
})
export class FavouritesComponent {
  favouriteItems: Booking[] = [
    {
      id: 1,
      name: '2-Bedroom Apartment in Lahore',
      address: 'DHA Phase 6, Lahore',
      dates: '2025-09-01 to 2025-09-05',
      total: 'PKR 5,000/day',
      status: 'available',
      imageUrl: '/images/download.jpg',
      category: 'Apartment',
      notes: '',
    },
    {
      id: 2,
      name: 'Canon DSLR Camera',
      address: 'Karachi',
      dates: '2025-09-02 to 2025-09-06',
      total: 'PKR 2,000/day',
      status: 'available',
      imageUrl: '/images/download.jpg',
      category: 'Tool',
      notes: 'Check with family first',
    },
  ];

  likedCounts: { [key: number]: number } = {
    1: 15,
    2: 8,
  };

  constructor(private router: Router) {}

  removeFavourite(id: number) {
    this.favouriteItems = this.favouriteItems.filter((item) => item.id !== id);
  }

  addToCart(id: number) {
    console.log(`Added to cart: ${id}`);
  }

  share(id: number) {
    console.log(`Sharing item ${id} via WhatsApp/Email/Copy Link`);
  }

  updateNotes(event: { id: number; notes: string }) {
    const item = this.favouriteItems.find((b) => b.id === event.id);
    if (item) item.notes = event.notes;
  }

  onNavigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.router.navigate(['/auth/login']);
  }
}
