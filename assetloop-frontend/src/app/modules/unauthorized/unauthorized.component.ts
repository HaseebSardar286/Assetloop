import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <div class="actions">
          <button (click)="goHome()" class="btn btn-primary">Go Home</button>
          <button (click)="logout()" class="btn btn-secondary">Logout</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f8f9fa;
    }
    
    .unauthorized-content {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .actions {
      margin-top: 1.5rem;
    }
    
    .btn {
      margin: 0 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
  `]
})
export class UnauthorizedComponent {
  
  constructor(
    private router: Router, 
    private authService: AuthService
  ) {}

  goHome(): void {
    const userRole = this.authService.getUserRole();
    switch (userRole) {
      case 'owner':
        this.router.navigate(['/owner/dashboard']);
        break;
      case 'renter':
        this.router.navigate(['/renter/dashboard']);
        break;
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
