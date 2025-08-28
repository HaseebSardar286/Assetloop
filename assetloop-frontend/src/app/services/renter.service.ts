import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Favourite {
  id: number;
  name: string;
  address: string;
  pricePerNight: string;
  description: string;
  amenities: string[];
  imageUrl: string;
}

interface CartItem {
  id: number;
  name: string;
  address: string;
  pricePerNight: string;
  description: string;
  amenities: string[];
  imageUrl: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class RenterService {
  private favourites = new BehaviorSubject<Favourite[]>([]);
  private cart = new BehaviorSubject<CartItem[]>([]);

  getFavourites() {
    return this.favourites.asObservable();
  }

  addToFavourites(fav: Favourite) {
    const current = this.favourites.value;
    if (!current.some((f) => f.id === fav.id)) {
      this.favourites.next([...current, fav]);
    }
  }

  removeFromFavourites(id: number) {
    this.favourites.next(this.favourites.value.filter((f) => f.id !== id));
  }

  getCart() {
    return this.cart.asObservable();
  }

  addToCart(item: Omit<CartItem, 'quantity'>) {
    const current = this.cart.value;
    const existing = current.find((c) => c.id === item.id);
    if (existing) {
      existing.quantity += 1;
      this.cart.next([...current]);
    } else {
      this.cart.next([...current, { ...item, quantity: 1 }]);
    }
  }

  updateCartQuantity(id: number, quantity: number) {
    const current = this.cart.value;
    const item = current.find((c) => c.id === id);
    if (item) {
      item.quantity = quantity > 0 ? quantity : 1;
      this.cart.next([...current]);
    }
  }

  removeFromCart(id: number) {
    this.cart.next(this.cart.value.filter((c) => c.id !== id));
  }
}
