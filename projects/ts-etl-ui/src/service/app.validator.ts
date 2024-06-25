import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function sourceFilePathValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    const value = control.value;

    if (!value) {
      return null;
    }

    const regex = new RegExp(`^file://nlmsombaserver.nlm.nih.gov/dev-ts-data-import/`);

    const isNlmServer = regex.test(value);

    return isNlmServer ? null : { sourceFilePathError: true };
  };
}