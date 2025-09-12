import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Refund } from '../../../interfaces/payments';

@Component({
  selector: 'app-refunds-disputes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './refunds-disputes.component.html',
  styleUrls: ['./refunds-disputes.component.css'],
})
export class RefundsDisputesComponent {
  refunds: Refund[] = [
    {
      id: 1,
      amount: 1000,
      status: 'in progress',
      timeline: ['2025-08-30: Requested', '2025-08-31: Under Review'],
    },
  ];
}
