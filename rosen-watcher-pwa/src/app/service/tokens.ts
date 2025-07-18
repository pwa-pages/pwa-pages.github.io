import { InjectionToken } from '@angular/core';

export const IS_ELEMENTS_ACTIVE = new InjectionToken<boolean>('IS_ELEMENTS_ACTIVE', {
  providedIn: 'root',
  factory: () => false,
});
