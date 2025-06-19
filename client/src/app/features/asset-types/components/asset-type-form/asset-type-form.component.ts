import {Component, EventEmitter, inject, Output} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-asset-type-form',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './asset-type-form.component.html',
  styleUrl: './asset-type-form.component.css'
})
export class AssetTypeFormComponent {
  @Output() submitAssetType = new EventEmitter<any>();
  fb = inject(FormBuilder);

  form = this.fb.group({
    name: ['', Validators.required]
  });

  onSubmit() {
    if (this.form.valid) {
      this.submitAssetType.emit(this.form.value);
    }
  }
}
