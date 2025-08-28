import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class SimpleDateValidator {
  /**
   * Validates that the date is not before now (current date/time)
   */
  static notBeforeNow(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const inputDate = new Date(control.value);
      const now = new Date();
      
      return inputDate < now 
        ? { notBeforeNow: { actualDate: control.value, currentDate: now } }
        : null;
    };
  }

  /**
   * Validates that the date is after the given date
   */
  static afterDate(compareDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const inputDate = new Date(control.value);
      const afterDate = new Date(compareDate);
      
      return inputDate <= afterDate 
        ? { afterDate: { actualDate: control.value, requiredAfterDate: compareDate } }
        : null;
    };
  }
}

// Helper function to get error messages
export function getSimpleDateValidationMessage(errors: ValidationErrors): string {
  if (errors['notBeforeNow']) {
    return 'Date cannot be in the past';
  }
  
  if (errors['afterDate']) {
    const requiredDate = new Date(errors['afterDate'].requiredAfterDate);
    return `Date must be after ${requiredDate.toLocaleDateString()}`;
  }
  
  return 'Invalid date';
}