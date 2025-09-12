import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTachometerAlt,
  faSearch,
  faCalendarCheck,
  faClipboardList,
  faHeart,
  faShoppingCart,
  faEnvelope,
  faCreditCard,
  faUserCog,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-renter-side-bar',
  imports: [FontAwesomeModule],
  templateUrl: './renter-side-bar.component.html',
  styleUrl: './renter-side-bar.component.css',
})
export class RenterSideBarComponent {
  faTachometerAlt = faTachometerAlt;
  faSearch = faSearch;
  faCalendarCheck = faCalendarCheck;
  faClipboardList = faClipboardList;
  faHeart = faHeart;
  faShoppingCart = faShoppingCart;
  faEnvelope = faEnvelope;
  faCreditCard = faCreditCard;
  faUserCog = faUserCog;

  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
