import {MaintenanceTask} from './maintenance-task';

export interface MaintenanceTaskApiResponse {
  success: boolean;
  message: string;
  data: MaintenanceTask[];
}
