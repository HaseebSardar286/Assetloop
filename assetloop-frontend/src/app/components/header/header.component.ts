import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faBell,
  faHeart,
  faSearch,
  faShoppingCart,
  faFilter,
  faHome,
  faSignOutAlt,
  faCog,
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  @Output() logout = new EventEmitter<void>();
  faUser = faUser;
  faBell = faBell;
  faHeart = faHeart;
  faSearch = faSearch;
  faShoppingCart = faShoppingCart;
  faFilter = faFilter;
  faHome = faHome;
  faSignOutAlt = faSignOutAlt;
  faCog = faCog;
  
  searchForm: FormGroup;
  currentRole: string | null = null;
  currentUser: any = null;
  dashboardRoute: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.searchForm = this.fb.group({
      keywords: [''],
    });
  }

  ngOnInit(): void {
    this.currentRole = this.authService.getUserRole();
    this.currentUser = this.authService.getCurrentUser();
    this.setDashboardRoute();
  }

  setDashboardRoute(): void {
    switch (this.currentRole) {
      case 'admin':
        this.dashboardRoute = '/admin/dashboard';
        break;
      case 'owner':
        this.dashboardRoute = '/owner/dashboard';
        break;
      case 'renter':
        this.dashboardRoute = '/renter/dashboard';
        break;
      default:
        this.dashboardRoute = '/';
    }
  }

  navigateToDashboard(): void {
    if (this.dashboardRoute) {
      this.router.navigate([this.dashboardRoute]);
    }
  }

  navigateToProfile(): void {
    switch (this.currentRole) {
      case 'admin':
        // Admin might not have a profile page, or navigate to settings
        this.router.navigate(['/admin/system-settings']);
        break;
      case 'owner':
        this.router.navigate(['/owner/profile']);
        break;
      case 'renter':
        this.router.navigate(['/renter/profile']);
        break;
    }
  }

  handleLogout(): void {
    this.authService.logout();
    this.logout.emit();
  }

  applySearch() {
    console.log('Search applied:', this.searchForm.value);
    // Add search logic here
  }

  filterListings() {
    this.router.navigate(['/renter/home']);
    // Add filter logic here
  }

  favourites() {
    this.router.navigate(['/renter/favourites']);
  }

  getRoleDisplayName(): string {
    switch (this.currentRole) {
      case 'admin':
        return 'Admin';
      case 'owner':
        return 'Owner';
      case 'renter':
        return 'Renter';
      default:
        return 'User';
    }
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      const firstName = this.currentUser.firstName || '';
      const lastName = this.currentUser.lastName || '';
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
      return this.currentUser.email || 'User';
    }
    return 'User';
  }
}

