import { InjectionToken } from '@angular/core';

export const ERROR_MESSAGES: { [key in string]: (args?: any) => string } = {
  required: () => `Required field`,
  email: () => `Not a valid email`,
  minlength: ({ requiredLength }) => `The length should be at least ${requiredLength} characters`,
  maxlength: ({ requiredLength }) => `The length should be maximum ${requiredLength} characters`,
  pattern: ({ pattern }) => `The field should have the pattern ${pattern}`,
};

export const VALIDATION_ERROR_MESSAGES = new InjectionToken(`Validation Messages`, {
  providedIn: 'root',
  factory: () => ERROR_MESSAGES,
});