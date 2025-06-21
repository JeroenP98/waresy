import {Component, Input} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-maintenance-task-history-table',
  imports: [
    DatePipe,
    NgClass,
    NgForOf,
    NgIf
  ],
  templateUrl: './maintenance-task-history-table.component.html',
  styleUrl: './maintenance-task-history-table.component.css'
})
export class MaintenanceTaskStatusHistoryTableComponent {
  @Input() history: {
    status: string;
    updatedAt: Date;
    updatedBy: {
      userID: string;
      fullName: string;
      email: string;
    }
  }[] = [];

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'badge-info';
      case 'In Progress':
        return 'badge-warning';
      case 'Completed':
        return 'badge-success';
      case 'Cancelled':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  }
}
