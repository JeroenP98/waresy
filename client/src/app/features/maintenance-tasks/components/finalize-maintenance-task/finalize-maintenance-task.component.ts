import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {MaintenanceTask} from '../../../../shared/models/maintenance-tasks/maintenance-task';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {DatePipe, NgIf} from '@angular/common';
import {performedAfterPlannedValidator} from '../../validators/performedAfterPlannedValidator';

@Component({
  selector: 'app-finalize-maintenance-task',
  imports: [
    ReactiveFormsModule,
    NgIf,
    DatePipe
  ],
  templateUrl: './finalize-maintenance-task.component.html',
  styleUrl: './finalize-maintenance-task.component.css'
})
export class FinalizeMaintenanceTaskComponent implements OnChanges {
  @Input() task: MaintenanceTask | null = null;
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{ report: string; performedDate: string }>();

  finalReportControl = new FormControl('', Validators.required);
  performedDateControl = new FormControl('', Validators.required);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task?.plannedDate) {
      const planned = new Date(this.task.plannedDate);
      if (!isNaN(planned.getTime())) {
        this.performedDateControl.setValidators([
          Validators.required,
          performedAfterPlannedValidator(planned)
        ]);
        this.performedDateControl.updateValueAndValidity();
      }
    }
  }

  onSubmit() {
    if (this.finalReportControl.valid && this.performedDateControl.valid) {
      this.submit.emit({
        report: this.finalReportControl.value ?? '',
        performedDate: this.performedDateControl.value ?? ''
      });
      this.finalReportControl.reset();
      this.performedDateControl.reset();
    }
  }

  onCancel() {
    this.finalReportControl.reset();
    this.performedDateControl.reset();
    this.cancel.emit();
  }
}
