import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {Asset} from '../../../../shared/models/assets/asset';
import {Supplier} from '../../../../shared/models/suppliers/supplier';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CreateMaintenanceTaskDto} from '../../../../shared/models/maintenance-tasks/create-maintenance-task-dto';
import {User} from '../../../../shared/models/users/user';
import {NgForOf, NgIf} from '@angular/common';
import {MultiSelect} from 'primeng/multiselect';
import {dateValidator} from '../../validators/dateValidator';

@Component({
  selector: 'app-maintenance-task-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    MultiSelect,
    NgIf
  ],
  templateUrl: './maintenance-task-form.component.html',
  styleUrl: './maintenance-task-form.component.css'
})
export class MaintenanceTaskFormComponent implements OnInit {

  @Output() submitTask = new EventEmitter<CreateMaintenanceTaskDto>();
  @Input() suppliers: Supplier[] = [];
  @Input() users: User[] = [];
  @Input() assets: Asset[] = [];
  @Input() formGroupAssetPreselect: Asset | null = null;

  fb = inject(FormBuilder);

  statusOptions: string[] = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  form = this.fb.group({
    description: ['', Validators.required],
    status: ['Pending', Validators.required],
    assignedTo: [null, Validators.required],
    contractor: [null, Validators.required],
    plannedDate: ['', [Validators.required, dateValidator()]],
    performedDate: [''],
    assets: this.fb.control<Asset[]>([], Validators.required)
  });

  ngOnInit(): void {
    if (this.formGroupAssetPreselect) {
      this.form.get('assets')?.setValue([this.formGroupAssetPreselect]);
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }


    const raw = this.form.value as unknown as MaintenanceTaskFormValue;
    if (!raw.assignedTo || !raw.contractor) return;

    const dto: CreateMaintenanceTaskDto = {
      description: raw.description,
      status: raw.status,
      plannedDate: new Date(raw.plannedDate),

      assignedTo: {
        userID: raw.assignedTo._id,
        firstName: raw.assignedTo.firstName,
        lastName: raw.assignedTo.lastName,
        email: raw.assignedTo.email
      },

      contractor: {
        supplierID: raw.contractor._id,
        name: raw.contractor.name,
        contactEmail: raw.contractor.contactEmail
      },
      assets: raw.assets.map(asset => {
        return {
          assetID: asset._id,
          assetName: asset.name,
          assetType: {
            assetTypeID: asset.assetType.assetTypeID,
            name: asset.assetType.name
          }
        };
      })
    };
    this.submitTask.emit(dto);
  }



}

type MaintenanceTaskFormValue = {
  description: string;
  status: string;
  assignedTo: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  contractor: {
    _id: string;
    name: string;
    contactEmail: string;
  } | null;
  plannedDate: string; // changed from Date
  assets: {
    _id: string;
    name: string;
    assetType: {
      assetTypeID: string;
      name: string;
    };
  }[];


};
