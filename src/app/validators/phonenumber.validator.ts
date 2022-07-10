// https://blog.angular-university.io/angular-custom-validators/
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function createIsPhoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    const value = control.value;

    if (!value) {
      return null;
    }

    const pattern = '^((\\+91-?)|0)?[0-9]{10}$';
    const mobileValid = value.match(pattern);

    return !mobileValid ? { isPhoneNumber: true } : null;
  };
}
