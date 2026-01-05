import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminService } from '../../../services/admin.service';

import { AssetConditionComponent } from '../../../components/asset-condition/asset-condition.component';

@Component({
  selector: 'app-dispute-resolution',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent, AssetConditionComponent, HeaderComponent],

  templateUrl: './dispute-resolution.component.html',
  styleUrls: ['./dispute-resolution.component.css']
})
export class DisputeResolutionComponent implements OnInit {
  disputes: any[] = [];
  loading = false;
  selectedBookingId: string | null = null;
  selectedBookingStatus: string = '';
  showConditionModal = false;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadDisputes();
  }

  loadDisputes() {
    this.loading = true;
    this.adminService.getDisputes().subscribe({
      next: (res) => {
        this.disputes = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  viewCondition(bookingId: string, status: string) {
    this.selectedBookingId = bookingId;
    this.selectedBookingStatus = status;
    this.showConditionModal = true;
  }

  closeModal() {
    this.showConditionModal = false;
    this.selectedBookingId = null;
  }

  resolveDispute(id: string, decision: 'RESOLVED' | 'REJECTED') {
    const comments = prompt(`Enter comments for ${decision} status:`);
    if (comments === null) return; // Cancelled

    this.adminService.resolveDispute(id, decision, comments).subscribe({
      next: () => {
        alert(`Dispute marked as ${decision}`);
        this.loadDisputes();
      },
      error: (err) => alert("Failed to update dispute")
    });
  }
}
