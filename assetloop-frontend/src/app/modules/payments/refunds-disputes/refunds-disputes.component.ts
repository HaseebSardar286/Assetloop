import { PaymentsService } from '../../../services/payments.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Refund } from '../../../interfaces/payments';

@Component({
  selector: 'app-refunds-disputes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './refunds-disputes.component.html',
  styleUrls: ['./refunds-disputes.component.css'],
})
export class RefundsDisputesComponent {
  refunds: Refund[] = [];
  loading = false;
  error: string | null = null;

  constructor(private paymentsService: PaymentsService) {
    this.loadRefunds();
  }

  loadRefunds() {
    this.loading = true;
    this.paymentsService.getRefunds().subscribe({
      next: (data) => {
        this.refunds = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load refunds';
        this.loading = false;
      }
    });
  }
}
