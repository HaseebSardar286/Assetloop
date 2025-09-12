import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faBell,
  faHeart,
  faSearch,
  faShoppingCart,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Output() logout = new EventEmitter<void>();
  faUser = faUser;
  faBell = faBell;
  faHeart = faHeart;
  faSearch = faSearch;
  faShoppingCart = faShoppingCart;
  faFilter = faFilter;
  searchForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.searchForm = this.fb.group({
      keywords: [''],
    });
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
}
