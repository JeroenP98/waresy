import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

// Custom validator to ensure performedDate >= plannedDate
export function performedAfterPlannedValidator(plannedDate: Date | undefined): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    console.log("planned date validator called with:", control.value);
    if (!control.value || !plannedDate) return null;

    const performed = new Date(control.value);
    const planned = new Date(plannedDate);
    planned.setHours(0, 0, 0, 0);
    performed.setHours(0, 0, 0, 0);

    return performed >= planned ? null : { beforePlanned: true };
  };
}
