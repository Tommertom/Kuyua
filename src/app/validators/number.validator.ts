// https://blog.angular-university.io/angular-custom-validators/
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function createIsNaNValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

        const value = control.value;

        if (!value) {
            return null;
        }

        const passwordValid = !isNaN(value);

        return !passwordValid ? { isNaN: true } : null;
    };
}
