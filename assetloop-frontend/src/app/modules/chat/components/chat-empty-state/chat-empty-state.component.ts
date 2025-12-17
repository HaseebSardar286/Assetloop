import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-chat-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './chat-empty-state.component.html',
  styleUrls: ['./chat-empty-state.component.css'],
})
export class ChatEmptyStateComponent {
  @Input() userRole: 'owner' | 'renter' = 'renter';
}
