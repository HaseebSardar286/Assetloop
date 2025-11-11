import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { Observable } from 'rxjs';
import { Bookings, Chat, UserProfile } from '../../../interfaces/bookings';
import { CartItem, Favourite } from '../../../interfaces/rental';
import { RenterService } from '../../../services/renter.service';

@Component({
  selector: 'app-renter-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RenterSideBarComponent,
    HeaderComponent,
  ],
  templateUrl: './renter-dashboard.component.html',
  styleUrls: ['./renter-dashboard.component.css'],
})
export class RenterDashboardComponent implements OnInit {
  userName = 'Renter';
  quickStats = {
    activeRentals: 0,
    pendingRequests: 0,
    wishlistItems: 0,
    totalSpent: 0,
  };
  bookings: Bookings = { current: [], past: [], cancelled: [], pending: [] };
  chats$: Observable<Chat[]> | undefined;
  userProfile: UserProfile | null = null;
  favourites$: Observable<Favourite[]> | undefined;
  cart$: Observable<CartItem[]> | undefined;
  error: string | null = null;
  loading = true;

  constructor(private renterService: RenterService, private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.favourites$ = this.renterService.getFavourites();
    this.cart$ = this.renterService.getCart();
    // Optional: Fetch chats and profile if implemented
    // this.chats$ = this.renterService.getChats();
    // this.renterService.getProfile().subscribe(profile => this.userProfile = profile);
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.renterService.getDashboardStats().subscribe({
      next: (stats) => {
        this.quickStats = stats;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load dashboard stats';
        this.loading = false;
      },
    });

    this.renterService.getBookings().subscribe({
      next: (allBookings) => {
        console.log(allBookings);
        const currentDate = new Date();
        this.bookings = {
          current: allBookings.filter(
            (b) =>
              (b.status === 'active' ||
                b.status === 'expiring soon' ||
                b.status === 'overdue') &&
              new Date(b.endDate) > currentDate
          ),
          past: allBookings.filter((b) => b.status === 'completed'),
          cancelled: allBookings.filter((b) => b.status === 'cancelled'), // Exclude pending
          pending: allBookings.filter((b) => b.status === 'pending'),
        };
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load bookings';
      },
    });
  }
  viewRentalDetails(id: string): void {
    console.log(`Viewing details for booking ${id}`);
    this.router.navigate([`/renter/rental-details/${id}`]);
  }

  cancelBooking(id: string): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.renterService.cancelBooking(id).subscribe({
        next: () => {
          this.bookings.cancelled = [
            ...this.bookings.cancelled,
            this.bookings.current.find((b) => b.id === id)!,
          ];
          this.bookings.current = this.bookings.current.filter(
            (b) => b.id !== id
          );
          this.quickStats.pendingRequests--;
          alert('Booking cancelled successfully');
        },
        error: (err: { error: { message: string } }) => {
          this.error = err.error?.message || 'Failed to cancel booking';
        },
      });
    }
  }

  leaveReview(id: string): void {
    console.log(`Leaving review for booking ${id}`);
    this.router.navigate([`/renter/review/${id}`]);
  }

  addToFavourites(fav: string): void {
    this.renterService.addToFavourites(fav);
  }

  removeFromFavourites(id: string): void {
    this.renterService.removeFromFavourites(id);
  }

  addToCart(item: Omit<CartItem, 'quantity'>): void {
    this.renterService.addToCart(item);
  }

  updateCartQuantity(id: string, quantity: number): void {
    this.renterService.updateCartQuantity(id, quantity);
  }

  removeFromCart(id: string): void {
    this.renterService.removeFromCart(id);
  }

  clearCart(): void {
    this.renterService.clearCart();
  }

  getCartTotal(): number {
    // cart$ is async; this method is unused or can be adapted to async pipe in template if needed.
    return 0;
  }

  logout(): void {
    this.router.navigate(['/auth/login']);
  }

  goToHome(): void {
    this.router.navigate(['/renter/dashboard']);
  }
}
