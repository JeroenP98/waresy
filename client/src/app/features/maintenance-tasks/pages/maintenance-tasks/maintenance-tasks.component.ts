import {Component, inject} from '@angular/core';
import {SupplierService} from '../../../suppliers/services/supplier.service';
import {AssetService} from '../../../assets/services/asset.service';
import {ToastService} from '../../../../core/services/toast-service.service';
import {Supplier} from '../../../../shared/models/suppliers/supplier';
import {Asset} from '../../../../shared/models/assets/asset';
import {MaintenanceTask} from '../../../../shared/models/maintenance-tasks/maintenance-task';
import {MaintenanceTasksService} from '../../services/maintenance-tasks.service';
import {MaintenanceTaskFormComponent} from '../../components/maintenance-task-form/maintenance-task-form.component';
import {MaintenanceTaskTableComponent} from '../../components/maintenance-task-table/maintenance-task-table.component';
import {
  MaintenanceTaskAssetsTableComponent
} from '../../components/maintenance-task-assets-table/maintenance-task-assets-table.component';
import {
  MaintenanceTaskStatusHistoryTableComponent
} from '../../components/maintenance-task-history-table/maintenance-task-history-table.component';
import {CreateMaintenanceTaskDto} from '../../../../shared/models/maintenance-tasks/create-maintenance-task-dto';
import {User} from '../../../../shared/models/users/user';
import {UserService} from '../../../users/services/user.service';

@Component({
  selector: 'app-maintenance-tasks',
  imports: [
    MaintenanceTaskFormComponent,
    MaintenanceTaskTableComponent,
    MaintenanceTaskAssetsTableComponent,
    MaintenanceTaskStatusHistoryTableComponent
  ],
  templateUrl: './maintenance-tasks.component.html',
  styleUrl: './maintenance-tasks.component.css'
})
export class MaintenanceTasksComponent {

  private maintenanceTaskService = inject(MaintenanceTasksService);
  private supplierService = inject(SupplierService);
  private userService = inject(UserService);
  private assetService = inject(AssetService);
  private toastService = inject(ToastService);
  suppliers: Supplier[] = [];
  assets: Asset[] = [];
  users: User[] = [];
  maintenanceTasks: MaintenanceTask[] = [];
  selectedTask: MaintenanceTask | null = null;

  handleSelectTask(task: MaintenanceTask) {
    this.selectedTask = task;
  }

  drawerOpen = false;
  ngOnInit(): void {
    this.fetchAll();
  }

  openDrawer() {
    // Show a modal or navigate to a form page
    this.drawerOpen = true;
  }

  closeDrawer() {
    this.drawerOpen = false;
  }

  private fetchAssets() {
    this.assetService.getAssets().subscribe(assets => {
      this.assets = assets;
    })
  }

  private fetchSuppliers() {
    this.supplierService.getSuppliers().subscribe(suppliers => {
      this.suppliers = suppliers;
    })
  }

  private fetchMaintenanceTasks() {
    this.maintenanceTaskService.getMaintenanceTasks().subscribe(maintenanceTasks => {
      this.maintenanceTasks = maintenanceTasks;
    })
  }

  private fetchUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  private fetchAll() {
    this.fetchAssets();
    this.fetchSuppliers();
    this.fetchMaintenanceTasks();
    this.fetchUsers();
  }

  handleFormSubmit(maintenanceTask: CreateMaintenanceTaskDto) {
    this.maintenanceTaskService.postMaintenanceTask(maintenanceTask).subscribe({
      next: (response) => {
        this.toastService.show(`Maintenance task ${response.taskName} created successfully`, 'success');
        this.closeDrawer();
        this.fetchMaintenanceTasks();
      },
      error: (error) => {
        this.toastService.show('Failed to create maintenance task: ' + error.message, 'error');
      }
    })
  }

  handleDelete(maintenanceTask: MaintenanceTask) {
    if (!confirm(`Are you sure you want to delete maintenance task "${maintenanceTask.taskName}"?`)) return;
    this.maintenanceTaskService.deleteMaintenanceTask(maintenanceTask._id).subscribe(() => {
      this.toastService.show(`Maintenance task "${maintenanceTask.taskName}" deleted successfully`, 'success');
      this.fetchMaintenanceTasks();
    })
  }

  handleStatusUpdate(update: { taskId: string; status: string }) {
    this.maintenanceTaskService.updateMaintenanceTaskStatus(update.taskId, update.status).subscribe({
      next: ({ message, task: updatedTask }) => {
        this.toastService.show(`Status updated to ${updatedTask.status}`, 'success');

        // Update the task in the list
        const index = this.maintenanceTasks.findIndex(t => t._id === updatedTask._id);
        if (index !== -1) this.maintenanceTasks[index] = updatedTask;

        // Also update selectedTask’s status and history
        if (this.selectedTask && this.selectedTask._id === updatedTask._id) {
          this.selectedTask.status = updatedTask.status;
          this.selectedTask.statusHistory = updatedTask.statusHistory;
        }
      },
      error: (err) => {
        this.toastService.show(`Failed to update task: ${err.message}`, 'error');
      }
    });
  }
}
