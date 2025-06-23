import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {MaintenanceTask} from '../../../shared/models/maintenance-tasks/maintenance-task';
import {MaintenanceTaskApiResponse} from '../../../shared/models/maintenance-tasks/maintenance-task-api-response';
import {AssetService} from '../../assets/services/asset.service';
import {CreateMaintenanceTaskDto} from '../../../shared/models/maintenance-tasks/create-maintenance-task-dto';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceTasksService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private assetService = inject(AssetService)

  getMaintenanceTasks(): Observable<MaintenanceTask[]> {
    return this.http
      .get<MaintenanceTaskApiResponse>(`${this.apiUrl}/maintenance-tasks`)
      .pipe(map(response => response.data));
  }

  getMaintenanceTaskById(_id: string): Observable<MaintenanceTask> {
    return this.http
      .get<{ success: boolean; message: string; data: MaintenanceTask }>(`${this.apiUrl}/maintenance-tasks/${_id}`)
      .pipe(
        map(response => {
          if (!response.success) {
            // throw a friendly error that you can show in the toast
            throw new Error(response.message || 'Maintenance task not found.');
          }
          return response.data;
        })
      );
  }

  postMaintenanceTask(task: CreateMaintenanceTaskDto): Observable<MaintenanceTask> {
    return this.http
      .post<{ success: boolean; message: string; data?: MaintenanceTask }>(
        `${this.apiUrl}/maintenance-tasks`,
        task
      )
      .pipe(
        map(response => {
          if (!response.success) {
            // throw a friendly error that you can show in the toast
            throw new Error(response.message || 'Maintenance task creation failed.');
          }
          return response.data!;
        })
      );
  }

  deleteMaintenanceTask(_id: string): Observable<MaintenanceTask> {
    return this.http
      .delete<{ success: boolean; message: string; data: MaintenanceTask }>(`${this.apiUrl}/maintenance-tasks/${_id}`)
      .pipe(map(res => res.data));
  }

  updateMaintenanceTaskStatus(taskId: string, status: string): Observable<{ message: string; task: MaintenanceTask }> {
    return this.http
      .patch<{ success: boolean; message: string; data: MaintenanceTask }>(
        `${this.apiUrl}/maintenance-tasks/${taskId}`,
        { status }
      )
      .pipe(
        switchMap(res => {
          if (!res.success) throw new Error(res.message);
          const task = res.data;

          const newAssetStatus = status === 'In Progress'
            ? 'Maintenance'
            : ['Completed', 'Cancelled'].includes(status)
              ? 'Active'
              : null;

          if (newAssetStatus && task.assets?.length) {
            const updateCalls = task.assets.map(asset =>
              this.assetService.updateAssetStatus(asset.assetID, newAssetStatus)
            );

            return forkJoin(updateCalls).pipe(
              map(() => ({ message: res.message, task }))
            );
          }

          return of({ message: res.message, task });
        })
      );
  }
}
