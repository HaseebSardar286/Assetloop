import { Component } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-user-details',
  imports: [HeaderComponent, AdminSidebarComponent, NgIf],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css',
})
export class UserDetailsComponent {
  error: any;
  asset: any;
  loading: any;
  addToFavourites() {
    throw new Error('Method not implemented.');
  }
  addToCart() {
    throw new Error('Method not implemented.');
  }
}
