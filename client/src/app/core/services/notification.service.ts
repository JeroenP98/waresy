import {inject, Injectable, signal} from '@angular/core';
import {MaintenanceTasksService} from '../../features/maintenance-tasks/services/maintenance-tasks.service';
import {AuthService} from '../auth/auth.service';
import {MaintenanceTaskNotification} from '../../shared/models/notification/maintenance-task-notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private maintenanceTaskService = inject(MaintenanceTasksService);
  private authService = inject(AuthService);

  notifications = signal<MaintenanceTaskNotification[]>([]);

  loadNotifications(): void {
    this.maintenanceTaskService.getMaintenanceTasks().subscribe(tasks => {
      const userId = this.authService.getUser()?.id;
      if (!userId) return;

      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      const result: MaintenanceTaskNotification[] = [];

      tasks.forEach(task => {
        if (task.assignedTo?.userID !== userId) return;
        if (task.status === 'Completed' || task.status === 'Cancelled') return;

        const plannedDate = new Date(task.plannedDate);
        if (plannedDate < today) {
          result.push({ category: 'overdue', task });
        } else if (plannedDate <= sevenDaysFromNow) {
          result.push({ category: 'due', task });
        } else {
          result.push({ category: 'upcoming', task });
        }
      });

      this.notifications.set(result);
    });
  }
}
