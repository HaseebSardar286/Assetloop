import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-verification-details',
  standalone: true,
  imports: [CommonModule, HeaderComponent, AdminSidebarComponent],
  templateUrl: './verification-details.component.html',
  styleUrls: ['./verification-details.component.css'],
})
export class VerificationDetailsComponent implements OnInit {
  user: any = null;
  loading = true;
  error: string | null = null;
  userId: string | null = null;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
      if (this.userId) {
        this.loadUserDetails();
      }
    });
  }

  loadUserDetails(): void {
    this.loading = true;
    this.error = null;
    this.adminService.getPendingUserById(this.userId!).subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
      },
      error: (err: { error: { message: string } }) => {
        console.error('Error fetching user details:', err);
        this.error = err.error?.message || 'Failed to load user details';
        this.loading = false;
      },
    });
  }

  approveUser(): void {
    if (confirm('Are you sure you want to approve this user?')) {
      this.adminService.approvePendingUser(this.userId!).subscribe({
        next: () => {
          alert('User approved successfully!');
          this.router.navigate(['/admin/account-verification']);
        },
        error: (err: { error: { message: string } }) => {
          console.error('Error approving user:', err);
          this.error = err.error?.message || 'Failed to approve user';
        },
      });
    }
  }

  rejectUser(): void {
    if (confirm('Are you sure you want to reject this user?')) {
      this.adminService.rejectPendingUser(this.userId!).subscribe({
        next: () => {
          alert('User rejected successfully!');
          this.router.navigate(['/admin/account-verification']);
        },
        error: (err: { error: { message: string } }) => {
          console.error('Error rejecting user:', err);
          this.error = err.error?.message || 'Failed to reject user';
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/account-verification']);
  }

  onLogout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    this.router.navigate(['/auth/login']);
  }
}
