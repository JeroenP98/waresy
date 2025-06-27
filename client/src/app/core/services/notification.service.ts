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
      today.setHours(0, 0, 0, 0);

      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);

      const result: MaintenanceTaskNotification[] = [];

      tasks.forEach(task => {
        // Skip tasks that are not assigned to the current user or are already completed/cancelled
        if (task.assignedTo?.userID !== userId) return;
        if (task.status === 'Completed' || task.status === 'Cancelled') return;

        const plannedDate = new Date(task.plannedDate);
        plannedDate.setHours(0, 0, 0, 0);
        // Check if the task is overdue or due within the next 7 days
        const isLateInProgress = task.status === 'In Progress' && plannedDate < today;

        if (isLateInProgress || plannedDate < today) {
          result.push({ category: 'overdue', task });
        } else if (plannedDate <= sevenDaysFromNow) {
          result.push({ category: 'due', task });
        } else {
          result.push({ category: 'upcoming', task });
        }
      });

      result.sort((a, b) => {
        const dateA = new Date(a.task.plannedDate).getTime();
        const dateB = new Date(b.task.plannedDate).getTime();
        return dateA - dateB;
      });

      this.notifications.set(result);
    });
  }
}
