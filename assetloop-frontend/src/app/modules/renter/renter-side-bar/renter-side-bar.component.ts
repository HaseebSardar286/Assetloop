import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-renter-side-bar',
  imports: [],
  templateUrl: './renter-side-bar.component.html',
  styleUrl: './renter-side-bar.component.css',
})
export class RenterSideBarComponent {
  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
