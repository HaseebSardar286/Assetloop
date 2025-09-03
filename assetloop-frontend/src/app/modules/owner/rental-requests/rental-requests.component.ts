import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';
@Component({
  selector: 'app-rental-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, OwnerSideBarComponent],
  templateUrl: './rental-requests.component.html',
  styleUrls: ['./rental-requests.component.css'],
})
export class RentalRequestsComponent {
  requests = [
    {
      id: 1,
      requester: 'Ali Khan',
      asset: 'Toyota Camry',
      date: '2025-09-01 14:00',
      status: 'pending',
      amount: '50/day',
    },
    {
      id: 2,
      requester: 'Sara Ahmed',
      asset: 'Apartment 2B',
      date: '2025-09-01 09:30',
      status: 'approved',
      amount: '1200/month',
    },
    {
      id: 3,
      requester: 'Omar Farooq',
      asset: 'House 3C',
      date: '2025-09-01 15:00',
      status: 'rejected',
      amount: '2000/month',
    },
  ];

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

  updateStatus(requestId: number, newStatus: string) {
    const request = this.requests.find((r) => r.id === requestId);
    if (request) {
      request.status = newStatus;
      console.log(`Request ${requestId} updated to ${newStatus}`);
    }
  }
}
