import {Component, EventEmitter, inject, Output} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent {
  @Output() submitUser = new EventEmitter<any>();
  fb = inject(FormBuilder);

  from = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.required],
    role: ['', Validators.required],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  })

  onSubmit() {
    if (this.from.valid && this.from.value.password === this.from.value.confirmPassword) {
      this.submitUser.emit(this.from.value);
    }
  }

}
