import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTachometerAlt,
  faCalendarCheck,
  faClipboardList,
  faCreditCard,
  faGear,
  faUser,
  faComment,
} from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-admin-sidebar',
  imports: [FontAwesomeModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
})
export class AdminSidebarComponent {
  faTachometerAlt = faTachometerAlt;
  faCalendarCheck = faCalendarCheck;
  faClipboardList = faClipboardList;
  faCreditCard = faCreditCard;
  faGear = faGear;
  faUser = faUser;
  faComment = faComment;

  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
