import { AbstractControl, ValidatorFn } from '@angular/forms';

export function shippingDateValidator(orderDateControlName: string, shippingDateControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): {[key: string]: boolean} | null => {
    const orderDate = formGroup.get(orderDateControlName)?.value;
    const deliveryDate = formGroup.get(shippingDateControlName)?.value;

    if (orderDate && deliveryDate && new Date(deliveryDate) < new Date(orderDate)) {
      return { 'invalidShippingDate': true };
    }
    return null;
  };
}

export function dateOfBirthValidator(dateOfBirthControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): {[key: string]: boolean} | null => {
    const date_of_birth = formGroup.get(dateOfBirthControlName)?.value;

    if (date_of_birth && new Date() < new Date(date_of_birth)) {
      return { 'invalidDateOfBirth': true };
    }
    return null;
  };
}

export function passwordValidator(passwordControlName: string, retypePasswordControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): {[key: string]: boolean} | null => {
    const password = formGroup.get(passwordControlName)?.value;
    const retype_password = formGroup.get(retypePasswordControlName)?.value;

    if (retype_password && password !==retype_password) {
      return { 'invalidPassword': true };
    }
    return null;
  };
}
