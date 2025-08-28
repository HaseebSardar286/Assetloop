import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-error-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.css',
})
export class ErrorPageComponent {
  goToHome() {
    alert('Redirecting to Home...');
    // Add navigation logic (e.g., this.router.navigate(['/']));
  }

  goToLogin() {
    alert('Redirecting to Login...');
    // Add navigation logic (e.g., this.router.navigate(['/login']));
  }
}
