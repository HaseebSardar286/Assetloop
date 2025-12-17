import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { RenterSideBarComponent } from '../renter-side-bar/renter-side-bar.component';
import { RenterService } from '../../../services/renter.service';
import { Subscription, forkJoin } from 'rxjs';
import { CartItem } from '../../../interfaces/rental';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTrash,
  faBroom,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    RenterSideBarComponent,
    FontAwesomeModule,
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  faTrash = faTrash;
  faBroom = faBroom;
  faArrowRight = faArrowRight;

  items: CartItem[] = [];
  private sub?: Subscription;
  loading = false;
  error: string | null = null;
  datesByItem: {
    [id: string]: { startDate?: string; endDate?: string; notes?: string };
  } = {};

  constructor(private renterService: RenterService, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.renterService.getCart().subscribe((items) => {
      this.items = items || [];
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  updateQuantity(item: CartItem, quantity: number): void {
    const q = Number(quantity);
    if (!isNaN(q)) {
      this.renterService.updateCartQuantity(item.id, q).subscribe(() => {
        item.quantity = q;
      });
    }
  }

  updateQuantityInput(item: CartItem, event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const value = target ? Number(target.value) : NaN;
    if (!isNaN(value) && value > 0) {
      this.renterService.updateCartQuantity(item.id, value).subscribe(() => {
        item.quantity = value;
      });
    }
  }

  remove(item: CartItem): void {
    this.renterService.removeFromCart(item.id).subscribe(() => {
      this.items = this.items.filter((i) => i.id !== item.id);
    });
  }

  clear(): void {
    if (confirm('Clear all items from cart?')) {
      this.renterService.clearCart().subscribe(() => {
        this.items = [];
      });
    }
  }

  total(): number {
    return this.renterService.getCartTotalFrom(this.items);
  }

  checkout(): void {
    this.error = null;
    if (!this.items.length) {
      alert('Your cart is empty.');
      return;
    }

    // Validate dates for all items
    const invalid = this.items.find((it) => {
      const d = this.datesByItem[it.id] || {};
      return (
        !d.startDate ||
        !d.endDate ||
        new Date(d.endDate!) <= new Date(d.startDate!)
      );
    });
    if (invalid) {
      alert(
        'Please select valid start and end dates for all items (end after start).'
      );
      return;
    }

    // Create bookings for each cart item
    const requests = this.items.map((it) => {
      const d = this.datesByItem[it.id]!;
      return this.renterService.createBooking({
        assetId: it.id,
        startDate: d.startDate!,
        endDate: d.endDate!,
        notes: d.notes || '',
      });
    });

    this.loading = true;
    forkJoin(requests).subscribe({
      next: () => {
        this.loading = false;
        // On successful checkout: remove booked items from cart in DB and UI
        this.renterService.clearCart().subscribe(() => {
          this.items = [];
          alert('Bookings created successfully. Cart cleared.');
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to complete checkout';
        alert(this.error);
      },
    });
  }

  lineTotal(item: CartItem): number {
    const price = Number(item.pricePerNight);
    return (isNaN(price) ? 0 : price) * item.quantity;
  }

  setStartDate(itemId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.datesByItem[itemId] = {
      ...(this.datesByItem[itemId] || {}),
      startDate: value,
    };
  }

  setEndDate(itemId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.datesByItem[itemId] = {
      ...(this.datesByItem[itemId] || {}),
      endDate: value,
    };
  }

  setNotes(itemId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.datesByItem[itemId] = {
      ...(this.datesByItem[itemId] || {}),
      notes: value,
    };
  }
}
