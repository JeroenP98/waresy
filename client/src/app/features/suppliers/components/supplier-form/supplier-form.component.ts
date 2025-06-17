import {Component, Output, EventEmitter, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-supplier-form',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.css'
})
export class SupplierFormComponent {
  @Output() submitSupplier = new EventEmitter<any>();
  fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    contactEmail: ['', [Validators.required, Validators.email]],
    phone: [''],
    website: ['']
  });

  constructor() {}

  onSubmit() {
    if (this.form.valid) {
      this.submitSupplier.emit(this.form.value);
      console.log(this.form.value);
    }
  }
}
