import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-owner-side-bar',
  imports: [],
  templateUrl: './owner-side-bar.component.html',
  styleUrl: './owner-side-bar.component.css',
})
export class OwnerSideBarComponent {
  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
