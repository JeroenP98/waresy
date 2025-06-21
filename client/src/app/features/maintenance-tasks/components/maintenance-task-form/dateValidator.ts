import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function dateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to 00:00
    console.log(inputDate, today)

    return inputDate < today ? { pastDate: true } : null;
  };
}
