import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToasterService } from '../toast/toaster.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToasterService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        // Client side error
        toastr.showError('No Internet connection');
      } else {
        // Server side error
        switch (error.status) {
          case 400:
            // throw the error again because 400 errors are most of the time
            // handled in catch blocks of the calling functions
            return throwError(() => error);
          case 401:
            toastr.showWarning('Unauthorized. Please log in again.');
            router.navigateByUrl('/login');
            break;
          case 403:
            toastr.showError('Forbidden. Permission issue.');
            break;
          case 404:
            // toastr.showInfo('Requested resource not found.');
            break;
          case 500:
            toastr.showError('Server error. Please try again later.');
            break;

          default:
            toastr.showError('Unexpected error. Please try again later.');
        }

        console.error(`Error ${error.status}:`, error.message);
      }

      return throwError(() => error);
    })
  );
};
