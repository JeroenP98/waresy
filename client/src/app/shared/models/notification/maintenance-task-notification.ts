import {MaintenanceTask} from '../maintenance-tasks/maintenance-task';

export type NotificationCategory = 'due' | 'overdue' | 'upcoming';

export interface MaintenanceTaskNotification {
  category: NotificationCategory;
  task: MaintenanceTask;
}
