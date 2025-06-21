import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AssetType} from '../../../../shared/models/asset-types/asset-type';
import {Supplier} from '../../../../shared/models/suppliers/supplier';
import {NgForOf, NgIf} from '@angular/common';
import {CreateAssetDto} from '../../../../shared/models/assets/create-asset-dto';

@Component({
  selector: 'app-assets-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './assets-form.component.html',
  styleUrl: './assets-form.component.css'
})
export class AssetsFormComponent {
  @Output() submitAsset = new EventEmitter<any>();
  @Input() assetTypes: AssetType[] = [];
  @Input() suppliers: Supplier[] = [];
  fb = inject(FormBuilder);

  statusOptions: string[] = ['Active', 'Inactive', 'Maintenance', 'Retired'];

  form = this.fb.group({
    name: ['', Validators.required],
    serialNumber: ['', Validators.required],
    status: ['', Validators.required],

    assetType: [null, Validators.required],  // Store AssetType object
    supplier: [null, Validators.required],   // Store Supplier object

    location: this.fb.group({
      locationId: ['none', Validators.required],
      name: ['', Validators.required]
    }),
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value as AssetFormValue;

    if (!raw.assetType || !raw.supplier) {
      return;
    }

    const dto: CreateAssetDto = {
      name: raw.name ?? '',
      serialNumber: raw.serialNumber ?? '',
      status: raw.status ?? 'Active',

      assetType: {
        assetTypeID: raw.assetType._id,
        name: raw.assetType.name,
      },

      supplier: {
        supplierID: raw.supplier._id,
        name: raw.supplier.name,
        contactEmail: raw.supplier.contactEmail,
        phone: raw.supplier.phone,
        website: raw.supplier.website,
      },

      location: {
        locationID: 'none',
        name: raw.location.name ?? '',
      }
    };

    this.submitAsset.emit(dto);
  }




}

type AssetFormValue = {
  name: string;
  serialNumber: string;
  status: string;
  assetType: {
    _id: string;
    name: string;
  } | null;
  supplier: {
    _id: string;
    name: string;
    contactEmail: string;
    phone: string;
    website: string;
  } | null;
  location: {
    name: string;
  };
};
