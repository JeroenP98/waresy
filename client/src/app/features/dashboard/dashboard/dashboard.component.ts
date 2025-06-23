import {Component, inject, OnInit} from '@angular/core';
import {NotificationService} from '../../../core/services/notification.service';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MaintenanceTaskNotification} from '../../../shared/models/notification/maintenance-task-notification';
import {MaintenanceTask} from '../../../shared/models/maintenance-tasks/maintenance-task';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MaintenanceTasksService} from '../../maintenance-tasks/services/maintenance-tasks.service';
import {ToastService} from '../../../core/services/toast-service.service';
import {
  FinalizeMaintenanceTaskComponent
} from '../../maintenance-tasks/components/finalize-maintenance-task/finalize-maintenance-task.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    NgClass,
    DatePipe,
    NgIf,
    NgForOf,
    ReactiveFormsModule,
    FinalizeMaintenanceTaskComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  notificationService = inject(NotificationService);
  notifications = this.notificationService.notifications;
  maintenanceTasksService = inject(MaintenanceTasksService);
  toastService = inject(ToastService);

  ngOnInit(): void {
    this.notificationService.loadNotifications();
  }

  dismiss(notification: MaintenanceTaskNotification) {
    const current = this.notifications().filter(n => n !== notification);
    this.notificationService.notifications.set(current);
  }

  selectedTaskToFinalize: MaintenanceTask | null = null;

  openFinalizeModal(task: MaintenanceTask) {
    this.selectedTaskToFinalize = task;
  }

  closeFinalizeModal() {
    this.selectedTaskToFinalize = null;
  }

  submitFinalReport(data: { report: string , performedDate: string}) {
    if (!this.selectedTaskToFinalize) return;

    const taskId = this.selectedTaskToFinalize._id;

    this.maintenanceTasksService.updateMaintenanceTask(taskId, {
      status: 'Completed',
      finalReport: data.report,
      performedDate: new Date(data.performedDate)
    }).subscribe(() => {
      this.toastService.show('Task finalized successfully.', 'success');
      this.selectedTaskToFinalize = null;
      this.notificationService.loadNotifications();
    });
  }
}
