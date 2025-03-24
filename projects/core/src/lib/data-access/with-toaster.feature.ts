import { inject } from '@angular/core';
import {
  signalStoreFeature,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { ToasterService } from './toaster/toaster.service';

export const withToasterFeature = () => {
  return signalStoreFeature(
    (withState({}),
    withProps(() => ({
      toasterService: inject(ToasterService),
    }))),
    withMethods(({ toasterService }) => ({
      _showSuccess: (msg?: string) => {
        toasterService.showSuccess(msg ?? 'Done successfully.');
      },

      _showError: (msg?: string) => {
        toasterService.showSuccess(
          msg ?? 'Error occured! Please try again later.'
        );
      },

      _showInfo: (msg?: string) => {
        toasterService.showSuccess(msg ?? 'Info message.');
      },

      _showWarning: (msg?: string) => {
        toasterService.showSuccess(msg ?? 'Warning message.');
      },
    }))
  );
};
