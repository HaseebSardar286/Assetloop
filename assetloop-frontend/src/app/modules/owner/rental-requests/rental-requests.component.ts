import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-rental-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, OwnerSideBarComponent],
  templateUrl: './rental-requests.component.html',
  styleUrls: ['./rental-requests.component.css'],
})
export class RentalRequestsComponent {
  requests: any[] = [];
  private apiUrl = 'http://localhost:5000/api/owner';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchRequests();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchRequests(): void {
    this.http
      .get<any[]>(`${this.apiUrl}/rental-requests`, {
        headers: this.getHeaders(),
      })
      .subscribe((list) => (this.requests = list));
  }

  onLogout() {
    // Handle logout
  }

  onNavigate(event: Event) {
    const target = event.target as HTMLAnchorElement;
    if (target && target.getAttribute('href')) {
      const path = target.getAttribute('href')!;
      console.log('Navigating to:', path);
    }
  }

  updateStatus(requestId: string, newStatus: 'confirmed' | 'cancelled') {
    this.http
      .put(
        `${this.apiUrl}/bookings/${requestId}/status`,
        { status: newStatus },
        { headers: this.getHeaders() }
      )
      .subscribe(() => this.fetchRequests());
  }
}
