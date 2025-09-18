import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTachometerAlt,
  faSearch,
  faCalendarCheck,
  faClipboardList,
  faEnvelope,
  faCreditCard,
  faUserCog,
  faAdd,
} from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-owner-side-bar',
  imports: [FontAwesomeModule],
  templateUrl: './owner-side-bar.component.html',
  styleUrl: './owner-side-bar.component.css',
})
export class OwnerSideBarComponent {
  faTachometerAlt = faTachometerAlt;
  faSearch = faSearch;
  faCalendarCheck = faCalendarCheck;
  faClipboardList = faClipboardList;
  faEnvelope = faEnvelope;
  faCreditCard = faCreditCard;
  faUserCog = faUserCog;
  faAdd = faAdd;
  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
