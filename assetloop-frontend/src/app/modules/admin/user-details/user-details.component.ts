import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../interfaces/user';

@Component({
  selector: 'app-user-details',
  imports: [HeaderComponent, AdminSidebarComponent, CommonModule, RouterLink],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css',
})
export class UserDetailsComponent implements OnInit {
  loading: boolean = true;
  error: string | null = null;
  user: User | null = null;
  userId: string | null = null;
  summary: any = null;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = params['id'] || null;
      if (this.userId) {
        this.fetchUser(this.userId);
        this.fetchSummary(this.userId);
      } else {
        this.loading = false;
        this.error = 'Missing user id in route';
      }
    });
  }

  fetchUser(id: string): void {
    this.loading = true;
    this.error = null;
    this.adminService.getUserById(id).subscribe({
      next: (data: User) => {
        this.user = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading user:', err);
        this.error = err?.error?.message || 'Failed to load user details';
        this.loading = false;
      },
    });
  }

  fetchSummary(id: string): void {
    this.adminService.getUserSummary(id).subscribe({
      next: (data: any) => {
        this.summary = data;
      },
      error: (err: any) => {
        console.warn('Failed to load user summary:', err);
      },
    });
  }

  onLogout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/auth/login']);
  }
}
