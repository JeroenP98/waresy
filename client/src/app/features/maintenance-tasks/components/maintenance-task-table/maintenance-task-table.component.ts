import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MaintenanceTask} from '../../../../shared/models/maintenance-tasks/maintenance-task';
import {DatePipe, NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-maintenance-task-table',
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    NgIf,
    NgForOf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault
  ],
  templateUrl: './maintenance-task-table.component.html',
  styleUrl: './maintenance-task-table.component.css'
})
export class MaintenanceTaskTableComponent {
  @Input() maintenanceTasks: Array<any> = [];
  @Output() add = new EventEmitter<MaintenanceTask | undefined>();
  @Output() delete = new EventEmitter<any>();
  @Output() updateStatus = new EventEmitter<{ taskId: string; status: string }>();
  @Output() selectTask = new EventEmitter<MaintenanceTask>();

  filteredTasks: Array<MaintenanceTask> = [];
  searchTerm: string = '';
  selectedTask: MaintenanceTask | null = null;
  statusOptions: string[] = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  onStatusChange(task: MaintenanceTask, newStatus: string) {
    if (task.status !== newStatus) {
      this.updateStatus.emit({ taskId: task._id, status: newStatus });
    }
  }

  selectMaintenanceTask(task: MaintenanceTask) {
    if (this.selectedTask?._id === task._id) {
      this.selectedTask = null; // unselect
      this.selectTask.emit(undefined);
    } else {
      this.selectedTask = task;
      this.selectTask.emit(task);
    }
  }

  onSearchChange() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredTasks = this.maintenanceTasks.filter(t =>
      Object.values(t).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(term)
      )
    );
  }

  ngOnChanges(): void {
    this.filteredTasks = [...this.maintenanceTasks];
    this.onSearchChange()
  }

  exportToJson(): void {
    if (!this.filteredTasks.length) return;
    const jsonData = JSON.stringify(this.filteredTasks, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenanceTasks_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  onAddMaintenanceTask() {
    this.add.emit();
  }

  onDeleteMaintenanceTask() {
    if (this.selectedTask) {
      this.delete.emit(this.selectedTask);
      this.selectedTask = null; // clear selection after deletion
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'badge-secondary';
      case 'In Progress':
        return 'badge-warning';
      case 'Completed':
        return 'badge-success';
      case 'Cancelled':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  }

  sortDirection: 'asc' | 'desc' | null = null;

  sortByPlannedDate() {
    if (this.sortDirection === 'asc') {
      this.sortDirection = 'desc';
    } else {
      this.sortDirection = 'asc';
    }

    this.filteredTasks.sort((a, b) => {
      const dateA = new Date(a.plannedDate).getTime();
      const dateB = new Date(b.plannedDate).getTime();

      return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

}
