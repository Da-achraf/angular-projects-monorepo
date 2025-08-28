import { AbstractControl, ValidationErrors } from '@angular/forms';

export const nonZeroValidator = (
  control: AbstractControl
): ValidationErrors | null => {
  const value = control.value;
  if (typeof value === 'number' && value === 0) {
    return { nonZero: true };
  }
  return null;
};
